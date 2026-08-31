import fs from 'fs/promises';
import path from 'path';
import { Store, StoreCategory, KyungHeeCollege, KHU_COLLEGES } from '../src/types';
import { AFFILIATE_STORES } from '../src/data/stores';
import { OFFICIAL_PARTNER_SOURCES, collegesForSource } from '../src/data/officialSources';
import { generateGeminiText } from './gemini';

export interface LiveStoreCache {
  stores: Store[];
  syncedAt: string | null;
  sources: string[];
  note?: string;
}

const CACHE_PATH = path.join(process.cwd(), 'data', 'live-stores.json');
const ALL_COLLEGES: KyungHeeCollege[] = [...KHU_COLLEGES];
const CAMPUS_CENTER = { lat: 37.248, lng: 127.078 };

let cache: LiveStoreCache = {
  stores: AFFILIATE_STORES,
  syncedAt: null,
  sources: [],
};
let syncing = false;

export function getLiveStoreCache(): LiveStoreCache {
  return cache;
}

export function isPartnerSyncing(): boolean {
  return syncing;
}

export async function loadLiveStoreCache(): Promise<LiveStoreCache> {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as LiveStoreCache;
    if (Array.isArray(parsed.stores) && parsed.stores.length > 0) {
      cache = {
        stores: parsed.stores.map(normalizeStore),
        syncedAt: parsed.syncedAt || null,
        sources: parsed.sources || [],
        note: parsed.note,
      };
    }
  } catch {
    cache = { stores: AFFILIATE_STORES, syncedAt: null, sources: [] };
  }
  return cache;
}

async function saveLiveStoreCache(next: LiveStoreCache) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(next, null, 2), 'utf8');
  cache = next;
}

export async function syncOfficialPartners(apiKey?: string): Promise<LiveStoreCache> {
  if (syncing) return cache;
  syncing = true;
  try {
    const pageSnippets = await collectOfficialPageText();
    let extracted: Partial<Store>[] = [];

    if (apiKey) {
      extracted = await extractStoresWithGemini(apiKey, pageSnippets);
    }

    if (extracted.length === 0) {
      const next: LiveStoreCache = {
        stores: cache.stores.length ? cache.stores : AFFILIATE_STORES,
        syncedAt: cache.syncedAt,
        sources: OFFICIAL_PARTNER_SOURCES.map((s) => s.handle),
        note: apiKey
          ? '공식 채널에서 새 매장을 파싱하지 못해 기존 목록을 유지했습니다.'
          : 'GEMINI_API_KEY가 없어 기존 제휴 목록을 유지합니다.',
      };
      return next;
    }

    const geocoded = await geocodeMissing(extracted);
    const merged = mergeStores(AFFILIATE_STORES, geocoded);
    const next: LiveStoreCache = {
      stores: merged,
      syncedAt: new Date().toISOString(),
      sources: OFFICIAL_PARTNER_SOURCES.map((s) => `@${s.handle}`),
      note: `공식 학생회 인스타/링크트리 기준으로 ${merged.length}개 매장을 반영했습니다.`,
    };
    await saveLiveStoreCache(next);
    return next;
  } finally {
    syncing = false;
  }
}

async function collectOfficialPageText(): Promise<string> {
  const chunks: string[] = [];
  for (const source of OFFICIAL_PARTNER_SOURCES) {
    for (const url of source.pageUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'KyungheeRoadPartnerBot/1.0 (campus student welfare map)',
            Accept: 'text/html',
          },
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) continue;
        const html = await res.text();
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 8000);
        if (text) {
          chunks.push(`[${source.title} | ${url}]\n${text}`);
        }
      } catch {
        // 공개 페이지 접근 실패는 검색 그라운딩으로 보완
      }
    }
  }
  return chunks.join('\n\n').slice(0, 24000);
}

async function extractStoresWithGemini(apiKey: string, pageSnippets: string): Promise<Partial<Store>[]> {
    const sourceBlock = OFFICIAL_PARTNER_SOURCES.map((s) => {
    const colleges = collegesForSource(s).join(', ');
    const verified = s.verified ? 'VERIFIED' : 'SEARCH_ONLY';
    return `- @${s.handle} [${verified}] (${s.title}) instagram: ${s.instagramUrl || '(검색으로 공식 계정 확인)'} pages: ${s.pageUrls.join(' ') || '(none)'} colleges: ${colleges} search: ${s.searchQuery}`;
  }).join('\n');

  const prompt = `너는 경희대학교 국제캠퍼스 제휴 매장 수집기다.
아래 [인증된 공식 계정]의 인스타그램 게시물·하이라이트·링크트리에 실제로 나온 제휴만 추출하라.
추측하거나 없는 가게를 만들지 마라. 학생회가 아닌 일반 광고/맛집 블로그는 무시하라.

[인증된 공식 계정]
${sourceBlock}

[공개 페이지에서 가져온 텍스트]
${pageSnippets || '(없음 — 구글 검색과 URL 컨텍스트로 인스타/링크트리를 확인하라)'}

구글 검색과 URL 컨텍스트를 사용해 위 계정들의 최신 제휴 안내를 확인하라.
JSON 배열만 출력하라. 설명 문장 금지.

각 원소 스키마:
{
  "name": "상호명",
  "type": "food|pub|cafe|life",
  "category": "짧은 업종 설명",
  "addr": "도로명 주소",
  "desc": "한 줄 소개",
  "benefit": "제휴 혜택 (줄바꿈 가능)",
  "sourceHandle": "인스타 핸들",
  "sourceUrl": "근거가 된 인스타 또는 링크트리 URL",
  "colleges": ["단과대학명", "..."],
  "isAllColleges": true/false,
  "phone": "있으면",
  "hours": "있으면",
  "period": "제휴 기간 (예: 2026.03.01 ~ 2026.11.30). 인스타 표에 기간이 있으면 그대로"
}

인스타 카드/표에 있는 상호명·혜택·기간·위치를 빠짐없이 옮겨라.
type 규칙: 식당=food, 술집/포차/호프=pub, 카페/디저트=cafe, 그 외(헬스/미용/사진/안경 등)=life.
총학생회 제휴는 isAllColleges true 와 colleges 전체.
단과대 학생회 제휴는 해당 단과대만 colleges에 넣는다.`;

  const text = await generateGeminiText({
    prompt,
    apiKey,
    timeoutMs: 90000,
    maxAttempts: 2,
    useGoogleSearch: true,
  });

  const parsed = parseJsonArray(text);
  return parsed
    .map((item) => sanitizeExtracted(item))
    .filter((item): item is Partial<Store> & { name: string; benefit: string } =>
      Boolean(item.name && item.benefit)
    );
}

function parseJsonArray(text: string): unknown[] {
  const trimmed = text.trim();
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const data = JSON.parse(trimmed.slice(start, end + 1));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function sanitizeExtracted(raw: unknown): Partial<Store> {
  if (!raw || typeof raw !== 'object') return {};
  const item = raw as Record<string, unknown>;
  const name = String(item.name || '').trim();
  const type = normalizeType(String(item.type || ''));
  const source = OFFICIAL_PARTNER_SOURCES.find(
    (s) => s.handle === String(item.sourceHandle || '').replace(/^@/, '')
  );
  const colleges = Array.isArray(item.colleges)
    ? (item.colleges.filter((c) => ALL_COLLEGES.includes(c as KyungHeeCollege)) as KyungHeeCollege[])
    : source
      ? collegesForSource(source)
      : ALL_COLLEGES;
  const isAllColleges = item.isAllColleges === true || colleges.length === ALL_COLLEGES.length;

  return {
    name,
    type,
    category: String(item.category || inferCategory(type)).slice(0, 80),
    addr: String(item.addr || '경기 수원시 영통구 / 용인시 기흥구').slice(0, 160),
    desc: String(item.desc || `${name} 경희대 국제캠퍼스 제휴 매장`).slice(0, 200),
    benefit: String(item.benefit || '').slice(0, 500),
    sourceHandle: String(item.sourceHandle || source?.handle || '').replace(/^@/, ''),
    sourceUrl: String(item.sourceUrl || source?.instagramUrl || ''),
    colleges: isAllColleges ? ALL_COLLEGES : colleges.length ? colleges : ALL_COLLEGES,
    isAllColleges,
    phone: item.phone ? String(item.phone) : undefined,
    hours: item.hours ? String(item.hours) : undefined,
    period: String(item.period || '2026.03.01 ~ 2026.11.30').slice(0, 80),
    img: defaultImage(type),
  };
}

function normalizeType(type: string): StoreCategory {
  const t = type.toLowerCase();
  if (t.includes('pub') || t.includes('술') || t.includes('주점')) return 'pub';
  if (t.includes('cafe') || t.includes('카페') || t.includes('디저트')) return 'cafe';
  if (t.includes('life') || t.includes('헬스') || t.includes('헤어') || t.includes('사진')) return 'life';
  return 'food';
}

function inferCategory(type: StoreCategory): string {
  if (type === 'pub') return '주점';
  if (type === 'cafe') return '카페';
  if (type === 'life') return '라이프';
  return '식당';
}

function defaultImage(type: StoreCategory): string {
  if (type === 'cafe') return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80';
  if (type === 'pub') return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80';
  if (type === 'life') return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80';
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, '').replace(/점$/g, '').toLowerCase();
}

function mergeStores(seed: Store[], live: Partial<Store>[]): Store[] {
  const byName = new Map<string, Store>();
  seed.forEach((store) => byName.set(normalizeName(store.name), store));

  live.forEach((incoming, index) => {
    if (!incoming.name) return;
    const key = normalizeName(incoming.name);
    const existing = byName.get(key);
    if (existing) {
      byName.set(key, {
        ...existing,
        benefit: incoming.benefit || existing.benefit,
        desc: incoming.desc || existing.desc,
        addr: incoming.addr && incoming.addr.length > 8 ? incoming.addr : existing.addr,
        category: incoming.category || existing.category,
        type: incoming.type || existing.type,
        colleges: incoming.colleges?.length ? incoming.colleges : existing.colleges,
        isAllColleges: incoming.isAllColleges ?? existing.isAllColleges,
        sourceHandle: incoming.sourceHandle || existing.sourceHandle,
        sourceUrl: incoming.sourceUrl || existing.sourceUrl,
        period: incoming.period || existing.period,
        phone: incoming.phone || existing.phone,
        hours: incoming.hours || existing.hours,
        verifiedAt: new Date().toISOString(),
      });
      return;
    }

    const lat = typeof incoming.lat === 'number' ? incoming.lat : CAMPUS_CENTER.lat + (Math.random() - 0.5) * 0.01;
    const lng = typeof incoming.lng === 'number' ? incoming.lng : CAMPUS_CENTER.lng + (Math.random() - 0.5) * 0.01;
    byName.set(key, normalizeStore({
      id: `live-${index}-${key}`.slice(0, 48),
      name: incoming.name,
      type: incoming.type || 'food',
      category: incoming.category || inferCategory(incoming.type || 'food'),
      addr: incoming.addr || '경기 수원시 영통구',
      lat,
      lng,
      desc: incoming.desc || '',
      benefit: incoming.benefit || '',
      discountScore: 80,
      popularScore: 80,
      img: incoming.img || defaultImage(incoming.type || 'food'),
      tags: ['인스타제휴'],
      colleges: incoming.colleges || ALL_COLLEGES,
      isAllColleges: incoming.isAllColleges,
      sourceHandle: incoming.sourceHandle,
      sourceUrl: incoming.sourceUrl,
      period: incoming.period,
      verifiedAt: new Date().toISOString(),
      phone: incoming.phone,
      hours: incoming.hours,
    }));
  });

  return [...byName.values()];
}

function normalizeStore(store: Store): Store {
  return {
    ...store,
    colleges: store.colleges?.length ? store.colleges : ALL_COLLEGES,
    isAllColleges: store.isAllColleges || store.colleges?.length === ALL_COLLEGES.length,
  };
}

async function geocodeMissing(items: Partial<Store>[]): Promise<Partial<Store>[]> {
  const result: Partial<Store>[] = [];
  for (const item of items) {
    if (item.lat && item.lng) {
      result.push(item);
      continue;
    }
    const seedMatch = AFFILIATE_STORES.find((s) => normalizeName(s.name) === normalizeName(item.name || ''));
    if (seedMatch) {
      result.push({ ...item, lat: seedMatch.lat, lng: seedMatch.lng, addr: item.addr || seedMatch.addr });
      continue;
    }
    const query = `${item.name || ''} ${item.addr || '영통 경희대'}`.trim();
    const geo = await nominatimGeocode(query);
    result.push({
      ...item,
      lat: geo?.lat ?? CAMPUS_CENTER.lat,
      lng: geo?.lng ?? CAMPUS_CENTER.lng,
    });
    await sleep(1100);
  }
  return result;
}

async function nominatimGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KyungheeRoad/1.0 (campus affiliate map)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data[0]) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
