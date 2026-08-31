import { Store, KyungHeeCollege, KHU_COLLEGES } from '../types';

export const ALL_COLLEGES_LIST: KyungHeeCollege[] = [...KHU_COLLEGES];

export const EXCLUDED_FOR_ENGINEERING_IDS = [
  'food-4',
  'food-6',
  'food-15',
  'pub-4',
  'pub-5',
  'cafe-2',
  'cafe-4',
  'life-2',
  'life-3',
  'life-13',
];

export function isStoreAffiliatedWithCollege(
  store: Store,
  college?: KyungHeeCollege | 'all' | null
): boolean {
  if (!college || college === 'all') return true;

  if (college === '공과대학' && EXCLUDED_FOR_ENGINEERING_IDS.includes(store.id)) {
    return false;
  }

  if (store.isAllColleges) return true;
  if (!store.colleges || store.colleges.length === 0) return false;
  if (store.colleges.length === KHU_COLLEGES.length) return true;
  return store.colleges.includes(college);
}

export function countStoresForCollege(
  stores: Store[],
  college: KyungHeeCollege | 'all'
): number {
  if (college === 'all') return stores.length;
  return stores.filter((s) => isStoreAffiliatedWithCollege(s, college)).length;
}

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
      label: `⚠️ ${currentCollege} 미제휴 (${store.colleges?.length || 0}개 단과대 전용)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      shortLabel: '타 단과대 전용',
    };
  }

  return {
    isAll: false,
    isAffiliatedWithCurrent: true,
    label: `🎓 ${currentCollege || '단과대'} 제휴 (${store.colleges?.length || 0}개 단과대)`,
    badgeClass: 'bg-red-50 text-[#8B1D24] border-red-200/80',
    shortLabel: '단과대 제휴',
  };
}
