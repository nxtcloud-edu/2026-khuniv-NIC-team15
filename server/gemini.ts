import { GoogleGenAI } from '@google/genai';

/** Gemini API가 안내하는 현재 Flash 모델만 사용 */
export const GEMINI_MODEL_CANDIDATES = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

export type GeminiGenerateOptions = {
  prompt: string;
  apiKey: string;
  timeoutMs?: number;
  maxAttempts?: number;
  useGoogleSearch?: boolean;
  useUrlContext?: boolean;
};

export async function generateGeminiText(options: GeminiGenerateOptions): Promise<string> {
  const {
    prompt,
    apiKey,
    timeoutMs = 45000,
    maxAttempts = GEMINI_MODEL_CANDIDATES.length,
    useGoogleSearch,
    useUrlContext,
  } = options;
  const ai = new GoogleGenAI({ apiKey });
  const tools: Array<Record<string, object>> = [];
  if (useGoogleSearch) tools.push({ googleSearch: {} });
  if (useUrlContext) tools.push({ urlContext: {} });

  let lastError: Error | null = null;

  for (const model of GEMINI_MODEL_CANDIDATES.slice(0, maxAttempts)) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: tools.length > 0 ? { tools: tools as never } : undefined,
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`GEMINI_TIMEOUT_${model}`)), timeoutMs);
        }),
      ]);

      const text = extractResponseText(response);
      if (text.trim()) {
        return text;
      }
      lastError = new Error(`Empty Gemini response from ${model}`);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message.toLowerCase();
      if (msg.includes('api key') || msg.includes('permission_denied') || msg.includes('401')) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Gemini 호출에 실패했습니다.');
}

function extractResponseText(response: { text?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string {
  try {
    if (typeof response.text === 'string' && response.text.trim()) {
      return response.text;
    }
  } catch {
    // blocked / no candidates
  }
  const parts = response.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('\n').trim();
}
