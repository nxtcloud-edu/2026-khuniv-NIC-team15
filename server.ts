import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory student feedback store
interface FeedbackItem {
  id: string;
  storeName: string;
  reason: string;
  votes: number;
  createdAt: string;
}

const feedbackList: FeedbackItem[] = [
  {
    id: '1',
    storeName: '육쌈냉면 영통점',
    reason: '여름에 시원하게 고기랑 냉면 먹기 좋아서 제휴 맺으면 인기 폭발할 것 같아요!',
    votes: 42,
    createdAt: '2026-08-25',
  },
  {
    id: '2',
    storeName: '서브웨이 영통경희대점',
    reason: '수업 전후로 간단히 끼니 챙기기 최고입니다. 콤보 할인이나 쿠키 무료 혜택 원해요!',
    votes: 38,
    createdAt: '2026-08-26',
  },
  {
    id: '3',
    storeName: '봉구스밥버거 서천점',
    reason: '우정원 기숙사 학우들의 든든한 가성비 아침식사 제휴 희망합니다!',
    votes: 29,
    createdAt: '2026-08-27',
  }
];

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feedback API
app.get('/api/feedback', (req, res) => {
  res.json({ success: true, items: feedbackList });
});

app.post('/api/feedback', (req, res) => {
  const { storeName, reason } = req.body;
  if (!storeName || !storeName.trim()) {
    return res.status(400).json({ error: '희망 매장명을 입력해주세요.' });
  }

  const newItem: FeedbackItem = {
    id: Date.now().toString(),
    storeName: storeName.trim(),
    reason: (reason || '').trim(),
    votes: 1,
    createdAt: new Date().toISOString().split('T')[0],
  };

  feedbackList.unshift(newItem);
  res.status(201).json({ success: true, item: newItem, items: feedbackList });
});

app.post('/api/feedback/:id/vote', (req, res) => {
  const { id } = req.params;
  const item = feedbackList.find(f => f.id === id);
  if (!item) {
    return res.status(404).json({ error: '건의 항목을 찾을 수 없습니다.' });
  }
  item.votes += 1;
  res.json({ success: true, item, items: feedbackList });
});

// AI Chatbot with Gemini & Kyung Hee Affiliate Knowledge
app.post('/api/chat', async (req, res) => {
  try {
    const { message, storeList, customApiKey } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'NO_API_KEY',
        message: '서버에 설정된 GEMINI_API_KEY가 없거나 제공되지 않았습니다. 로컬 추천 모드를 사용합니다.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `너는 경희대학교 국제캠퍼스(용인/수원 영통) 학우들을 위한 친절하고 센스있는 AI 어시스턴트 '제휴봇 🦁'이야.
사용자의 질문(식사 메뉴 추천, 단체 회식, 카공 카페, 술집, 피트니스/뷰티 등)에 맞춰 실제 경희대 제휴 매장 데이터를 바탕으로 정확하고 실속있게 답변해줘.

[규칙]:
1. 반드시 아래 제공된 [경희대 제휴업체 DB]에 있는 매장 정보를 기반으로 추천할 것.
2. 매장 이름을 언급할 때는 정확한 상호명을 사용해줘. (사용자 클릭 시 지도 연동 지원)
3. 해당 매장의 '실제 제휴 혜택'과 '선정 이유'를 명쾌하고 보기 좋게 요약해서 설명해줘.
4. 친절하고 열정적인 경희대 학우 선배/후배 느낌의 친근한 톤(이모지 포함)을 유지해줘.
5. 학생증(모바일 학생증 포함) 지참 필수 안내도 센스있게 덧붙여줘.

[경희대 제휴업체 DB]:
${JSON.stringify(storeList || [], null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n학우 질문: "${message}"` }]
        }
      ]
    });

    const reply = response.text || '죄송해요, 답변을 생성하지 못했습니다.';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'GEMINI_ERROR',
      message: error.message || 'Gemini 호출 중 오류가 발생했습니다.'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦁 Kyunghee Road server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
