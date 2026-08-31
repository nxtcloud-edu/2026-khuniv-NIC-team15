import React, { useState } from 'react';
import { FilterType, Store, StudentProfile, KyungHeeCollege, KHU_COLLEGES } from '../types';
import { isStoreAffiliatedWithCollege, getCollegeBadgeInfo, countStoresForCollege } from '../utils/collegeAffiliation';
import {
  Search,
  MapPin,
  Sparkles,
  Trophy,
  MessageSquareText,
  Calculator,
  X,
  UserCircle,
  Edit3,
  GraduationCap,
  ChevronDown,
  Building,
  RefreshCw,
} from 'lucide-react';

interface HeaderNavProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onSearch: (query: string) => void;
  onSelectStore: (store: Store) => void;
  onFocusGate: () => void;
  onOpenLadder: () => void;
  onOpenSavings: () => void;
  onOpenProfile: () => void;
  studentProfile: StudentProfile | null;
  stores: Store[];
  activeCollege: KyungHeeCollege | 'all';
  onSelectActiveCollege: (college: KyungHeeCollege | 'all') => void;
  filteredCount: number;
  myCollegeCount: number;
  selectedCollegeCount: number;
  totalStoreCount: number;
  syncMeta: { syncedAt: string | null; syncing: boolean; note?: string };
  onSyncPartners: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentFilter,
  onFilterChange,
  onSearch,
  onSelectStore,
  onFocusGate,
  onOpenLadder,
  onOpenSavings,
  onOpenProfile,
  studentProfile,
  stores,
  activeCollege,
  onSelectActiveCollege,
  filteredCount,
  myCollegeCount,
  selectedCollegeCount,
  totalStoreCount,
  syncMeta,
  onSyncPartners,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onSearch(val);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const visibleStores = stores.filter((s) => isStoreAffiliatedWithCollege(s, activeCollege));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const match = visibleStores.find(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.benefit.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (match) {
        onSelectStore(match);
        setIsSearchFocused(false);
      }
    }
  };

  const searchSuggestions = searchTerm.trim()
    ? visibleStores
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const filterButtons: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: '전체', icon: '🌟' },
    { type: 'food', label: '식당', icon: '🍽️' },
    { type: 'pub', label: '주점', icon: '🍺' },
    { type: 'cafe', label: '카페/디저트', icon: '☕' },
    { type: 'life', label: '운동/라이프', icon: '💪' },
  ];

  const userCollege = studentProfile?.college || '공과대학';

  return (
    <header className="absolute top-3 sm:top-4 left-3 sm:left-4 z-[1000] flex flex-col gap-2 w-[calc(100vw-24px)] sm:w-[440px] max-w-[94vw] pointer-events-auto">
      {/* Top row: Brand & Ladder Button */}
      <div className="flex gap-2 items-stretch">
        <div className="flex-1 bg-[#8B1D24] text-white px-3.5 py-2.5 rounded-2xl shadow-lg border border-red-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-lg shadow-inner">
              🦁
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold tracking-tight text-[15px] sm:text-[16px]">KYUNGHEE ROAD</span>
                <span className="text-[10px] bg-yellow-400 text-red-950 font-black px-1.5 py-0.5 rounded">국제캠</span>
              </div>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">
                경희대학교 단과대별 제휴 지도
              </p>
            </div>
          </div>
        </div>

        {/* '오늘 뭐 먹지?' 사다리 추천 버튼 */}
        <button
          id="ladder-button"
          onClick={onOpenLadder}
          className="bg-white hover:bg-red-50 text-[#8B1D24] border-[1.5px] border-[#8B1D24] rounded-2xl px-3 py-2 text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0 active:scale-95 cursor-pointer"
          title="오늘 뭐 먹지? 사다리 타기로 식당 고르기"
        >
          <span className="flex items-center gap-1 text-[12px] font-extrabold">
            🎲 오늘 뭐 먹지?
          </span>
          <span className="text-[10px] text-[#8B1D24]/80 font-semibold">사다리 추천 🎯</span>
        </button>
      </div>

      {/* College Filter Bar & Switcher */}
      <div className="bg-white/95 backdrop-blur-sm border border-red-200/90 rounded-2xl p-2 px-2.5 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <GraduationCap className="w-4 h-4 text-[#8B1D24] shrink-0" />
            <span className="text-[11px] font-black text-gray-800 shrink-0">단과대 제휴:</span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0">
              <button
                id="btn-college-my"
                onClick={() => onSelectActiveCollege(userCollege)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
                  activeCollege === userCollege
                    ? 'bg-[#8B1D24] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={`${userCollege} 제휴 매장만 보기`}
              >
                {userCollege} ({myCollegeCount}개)
              </button>
              <button
                id="btn-college-all"
                onClick={() => onSelectActiveCollege('all')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
                  activeCollege === 'all'
                    ? 'bg-[#8B1D24] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={`전체 단과대 매장 ${totalStoreCount}개 보기`}
              >
                전체 ({totalStoreCount}개)
              </button>
            </div>
          </div>

          {/* College Dropdown for quick test */}
          <div className="relative">
            <select
              value={activeCollege}
              onChange={(e) => onSelectActiveCollege(e.target.value as KyungHeeCollege | 'all')}
              className="text-[10px] font-bold bg-red-50 text-[#8B1D24] border border-red-200 rounded-lg px-1.5 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-[#8B1D24]"
              title="다른 단과대학 제휴 현황 확인"
            >
              <option value="all">전체 ({totalStoreCount}개)</option>
              {KHU_COLLEGES.map((c) => {
                const count = countStoresForCollege(stores, c);
                return (
                  <option key={c} value={c}>
                    {c} ({count}개)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 font-semibold px-0.5">
          지금 지도에 표시: {activeCollege === 'all' ? '전체' : activeCollege} {selectedCollegeCount}곳
          {activeCollege !== 'all' && selectedCollegeCount !== totalStoreCount
            ? ` · 전체 ${totalStoreCount}곳 중`
            : ''}
        </p>

        {/* Student Profile Row */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 cursor-pointer text-gray-700 hover:text-[#8B1D24] group truncate"
          >
            <span className="w-4 h-4 rounded-full bg-red-100 text-[#8B1D24] flex items-center justify-center text-[10px] font-bold shrink-0">
              🪪
            </span>
            <span className="font-bold truncate">
              {studentProfile ? `${studentProfile.name} (${studentProfile.college})` : '학우 정보 등록하기'}
            </span>
            <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-[#8B1D24] shrink-0" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              onClick={onOpenSavings}
              className="flex items-center gap-1 text-[11px] font-bold text-[#8B1D24] bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              title="학우 혜택 계산기"
            >
              <Calculator className="w-3 h-3" />
              <span>절약 계산기</span>
            </div>

            <button
              onClick={onSyncPartners}
              disabled={syncMeta.syncing}
              className="text-[10px] font-bold bg-red-50 hover:bg-red-100 text-[#8B1D24] px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer disabled:opacity-60"
              title={syncMeta.note || '공식 학생회 인스타그램 제휴를 AI가 다시 수집합니다'}
            >
              <RefreshCw className={`w-3 h-3 ${syncMeta.syncing ? 'animate-spin' : ''}`} />
              <span>{syncMeta.syncing ? '제휴 수집 중' : '인스타 제휴 동기화'}</span>
            </button>

            <button
              id="gate-locator-button"
              onClick={onFocusGate}
              className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer"
              title="경희대 정문 위치로 이동"
            >
              <span>🏛️ 정문</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <div className="bg-white rounded-xl shadow-md border border-gray-200/90 flex items-center px-2.5 py-1.5 gap-2 focus-within:ring-2 focus-within:ring-[#8B1D24]/30 focus-within:border-[#8B1D24] transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeCollege === 'all'
                ? '전체 제휴 매장 검색 (예: 라멘, 삼겹살, 할인)'
                : `${activeCollege} 제휴 매장 검색 (예: 라멘, 할인)`
            }
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              const match = visibleStores.find(
                (s) =>
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.category.toLowerCase().includes(searchTerm.toLowerCase())
              );
              if (match) onSelectStore(match);
            }}
            className="bg-[#8B1D24] hover:bg-[#72151b] text-white px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            검색
          </button>
        </div>

        {/* Autocomplete suggestion dropdown */}
        {isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 divide-y divide-gray-100">
            {searchSuggestions.map((store) => {
              const badgeInfo = getCollegeBadgeInfo(
                store,
                activeCollege === 'all' ? userCollege : activeCollege
              );
              return (
                <div
                  key={store.id}
                  onClick={() => {
                    onSelectStore(store);
                    setIsSearchFocused(false);
                    setSearchTerm(store.name);
                  }}
                  className="p-2.5 hover:bg-red-50/70 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {store.type === 'food'
                        ? '🍽️'
                        : store.type === 'pub'
                        ? '🍺'
                        : store.type === 'cafe'
                        ? '☕'
                        : '💪'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{store.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${badgeInfo.badgeClass}`}>
                          {badgeInfo.shortLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">{store.category}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#8B1D24] font-semibold truncate max-w-[140px]">
                    {store.benefit.split('\n')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Filter Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {filterButtons.map((btn) => {
          const isActive = currentFilter === btn.type;
          return (
            <button
              key={btn.type}
              id={`filter-btn-${btn.type}`}
              onClick={() => onFilterChange(btn.type)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#8B1D24] text-white shadow-red-950/20 scale-[1.02]'
                  : 'bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
              {btn.type === currentFilter && (
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full ml-0.5">
                  {filteredCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
