import { Store, KyungHeeCollege, KHU_COLLEGES } from '../types';

export const ALL_COLLEGES_LIST: KyungHeeCollege[] = [...KHU_COLLEGES];

// 10 stores specifically excluded for 공과대학 (Engineering College)
export const EXCLUDED_FOR_ENGINEERING_IDS = [
  'food-4', // 존앤진피자펍 행궁본점
  'food-6', // 그로또
  'food-15', // 꾼돈 숯불갈비 영통역점
  'pub-4', // 범맥주 수원영통점
  'pub-5', // 이자카야 유키
  'cafe-2', // 행궁빙수
  'cafe-4', // 카페 쿠모
  'life-2', // 헤어스케치 영통점
  'life-3', // 필라테스 더랩
  'life-13', // 점핑배틀 수원영통점
];

// Helper to check if store is affiliated with a specific college
export function isStoreAffiliatedWithCollege(store: Store, college?: KyungHeeCollege | 'all' | null): boolean {
  if (!college || college === 'all') return true;
  if (store.isAllColleges) return true;
  if (!store.colleges || store.colleges.length === 0) return true;
  return store.colleges.includes(college);
}

// Get affiliation badge details for UI
export function getCollegeBadgeInfo(store: Store, currentCollege?: KyungHeeCollege | null) {
  const isAll = store.isAllColleges || store.colleges?.length === KHU_COLLEGES.length;
  const isAffiliatedWithCurrent = currentCollege
    ? isStoreAffiliatedWithCollege(store, currentCollege)
    : true;

  if (isAll) {
    return {
      isAll: true,
      isAffiliatedWithCurrent: true,
      label: '🏛️ 전 단과대 공통',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      shortLabel: '전체 공통',
    };
  }

  if (currentCollege && !isAffiliatedWithCurrent) {
    return {
      isAll: false,
      isAffiliatedWithCurrent: false,
      label: `⚠️ ${currentCollege} 미제휴 (${store.colleges.length}개 단과대 전용)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      shortLabel: '타 단과대 전용',
    };
  }

  return {
    isAll: false,
    isAffiliatedWithCurrent: true,
    label: `🎓 ${currentCollege || '단과대'} 제휴 (${store.colleges.length}개 단과대)`,
    badgeClass: 'bg-red-50 text-[#8B1D24] border-red-200/80',
    shortLabel: '단과대 제휴',
  };
}
