export type StoreCategory = 'food' | 'pub' | 'cafe' | 'life';
export type FilterType = 'all' | StoreCategory;

export const KHU_COLLEGES = [
  '공과대학',
  '전자정보대학',
  '소프트웨어융합대학',
  '응용과학대학',
  '생명과학대학',
  '국제대학',
  '외국어대학',
  '예술디자인대학',
  '체육대학',
  '자유전공학부',
  '동서의과학과',
  '융합전공',
] as const;

export type KyungHeeCollege = typeof KHU_COLLEGES[number];

export interface StudentProfile {
  college: KyungHeeCollege;
  name: string;
  studentNumber?: string;
  major?: string;
}

export interface Store {
  id: string;
  name: string;
  type: StoreCategory;
  category: string;
  addr: string;
  lat: number;
  lng: number;
  desc: string;
  benefit: string;
  discountScore: number;
  img: string;
  phone?: string;
  hours?: string;
  tags?: string[];
  popularScore?: number;
  estimatedSaving?: string;
  colleges: KyungHeeCollege[];
  isAllColleges?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  storeTags?: string[];
  isError?: boolean;
}

export interface FeedbackItem {
  id: string;
  storeName: string;
  reason: string;
  votes: number;
  createdAt: string;
}
