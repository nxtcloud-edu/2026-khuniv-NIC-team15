import React, { useState, useMemo } from 'react';
import { Store, StoreCategory, KyungHeeCollege, KHU_COLLEGES } from '../types';
import { KHU_GATE_LOCATION } from '../data/stores';
import { getCollegeBadgeInfo, isStoreAffiliatedWithCollege } from '../utils/collegeAffiliation';
import {
  X,
  Flame,
  Percent,
  MapPin,
  Sparkles,
  Navigation,
  Search,
  Gift,
  Clock,
  Phone,
  Tag,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  Building2,
} from 'lucide-react';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onSelectStore: (store: Store) => void;
  initialTab?: 'popular' | 'discount' | 'nearest';
  currentCollege?: KyungHeeCollege | null;
}

// Distance helper in meters
function getDistanceFromGate(lat: number, lng: number): number {
  const R = 6371e3; // meters
  const phi1 = (KHU_GATE_LOCATION.lat * Math.PI) / 180;
  const phi2 = (lat * Math.PI) / 180;
  const deltaPhi = ((lat - KHU_GATE_LOCATION.lat) * Math.PI) / 180;
  const deltaLambda = ((lng - KHU_GATE_LOCATION.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  stores,
  onSelectStore,
  initialTab = 'popular',
  currentCollege = '공과대학',
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'discount' | 'nearest'>(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<'all' | StoreCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeScope, setCollegeScope] = useState<'current' | 'all'>('current');
  const [selectedCollege, setSelectedCollege] = useState<KyungHeeCollege>(currentCollege || '공과대학');

  // Synchronize initialTab if prop changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (currentCollege) {
      setSelectedCollege(currentCollege);
    }
  }, [currentCollege]);

  const filteredAndSortedStores = useMemo(() => {
    let list = stores.filter((s) => {
      // College affiliation check
      if (collegeScope === 'current') {
        if (!isStoreAffiliatedWithCollege(s, selectedCollege)) {
          return false;
        }
      }

      const matchCategory = categoryFilter === 'all' || s.type === categoryFilter;
      if (!matchCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.benefit.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });

    if (activeTab === 'popular') {
      return [...list].sort((a, b) => (b.popularScore || 0) - (a.popularScore || 0));
    } else if (activeTab === 'discount') {
      return [...list].sort((a, b) => b.discountScore - a.discountScore);
    } else if (activeTab === 'nearest') {
      return [...list].sort((a, b) => {
        const distA = getDistanceFromGate(a.lat, a.lng);
        const distB = getDistanceFromGate(b.lat, b.lng);
        return distA - distB;
      });
    }
    return list;
  }, [stores, collegeScope, selectedCollege, categoryFilter, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 1. Modal Header */}
        <div className="bg-gradient-to-r from-[#8B1D24] via-[#78141b] to-[#590e13] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg leading-tight tracking-tight">
                  경희대 제휴업체 랭킹 TOP
                </h3>
                <span className="text-[10px] bg-yellow-400 text-red-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                  {collegeScope === 'current' ? `${selectedCollege} ${filteredAndSortedStores.length}개 매장` : `전체 ${filteredAndSortedStores.length}개 매장`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 font-medium">
                {collegeScope === 'current'
                  ? `[${selectedCollege}] 학생회 제휴 매장 대상 순위입니다.`
                  : '경희대학교 국제캠퍼스 전체 제휴 매장 순위입니다.'}
              </p>
            </div>
          </div>
          <button
            id="close-ranking-modal-btn"
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. College Filter Bar & Tab Selector */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 pt-3 pb-3 space-y-2.5 shrink-0">
          {/* College Scope & Selector Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-red-50/70 p-2 rounded-2xl border border-red-100">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#8B1D24] shrink-0" />
              <span className="text-xs font-bold text-gray-800">단과대 범위:</span>
              <div className="flex bg-white rounded-xl p-0.5 border border-red-200 shadow-xs">
                <button
                  onClick={() => setCollegeScope('current')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                    collegeScope === 'current'
                      ? 'bg-[#8B1D24] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  내 단과대 ({selectedCollege})
                </button>
                <button
                  onClick={() => setCollegeScope('all')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                    collegeScope === 'all'
                      ? 'bg-[#8B1D24] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  전체 단과대 공통 (42개)
                </button>
              </div>
            </div>

            {/* Quick College Dropdown */}
            {collegeScope === 'current' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-bold">단과대 변경:</span>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value as KyungHeeCollege)}
                  className="text-xs font-black bg-white border border-gray-300 text-gray-800 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-[#8B1D24]"
                >
                  {KHU_COLLEGES.map((col) => (
                    <option key={col} value={col}>
                      {col} ({stores.filter((s) => isStoreAffiliatedWithCollege(s, col)).length}개)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Main Tab Switcher */}
          <div className="grid grid-cols-3 bg-gray-100/90 p-1.5 rounded-2xl gap-1.5 text-xs font-black">
            <button
              id="tab-rank-popular"
              onClick={() => setActiveTab('popular')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-[#8B1D24] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Flame className={`w-4 h-4 ${activeTab === 'popular' ? 'text-yellow-300' : 'text-orange-500'}`} />
              <span className="whitespace-nowrap">🔥 인기 순위</span>
            </button>
            <button
              id="tab-rank-discount"
              onClick={() => setActiveTab('discount')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'discount'
                  ? 'bg-[#8B1D24] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Percent className={`w-4 h-4 ${activeTab === 'discount' ? 'text-yellow-300' : 'text-emerald-600'}`} />
              <span className="whitespace-nowrap">💸 할인 혜택순</span>
            </button>
            <button
              id="tab-rank-nearest"
              onClick={() => setActiveTab('nearest')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'nearest'
                  ? 'bg-[#8B1D24] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Navigation className={`w-4 h-4 ${activeTab === 'nearest' ? 'text-yellow-300' : 'text-blue-600'}`} />
              <span className="whitespace-nowrap">📍 정문 거리순</span>
            </button>
          </div>

          {/* Filter Bar: Category chips + in-modal search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(
                [
                  { id: 'all', label: '전체' },
                  { id: 'food', label: '🍽️ 식당' },
                  { id: 'pub', label: '🍺 주점' },
                  { id: 'cafe', label: '☕ 카페' },
                  { id: 'life', label: '💪 라이프' },
                ] as const
              ).map((cat) => {
                const count = stores.filter((s) => {
                  if (collegeScope === 'current' && !isStoreAffiliatedWithCollege(s, selectedCollege)) {
                    return false;
                  }
                  return cat.id === 'all' || s.type === cat.id;
                }).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      categoryFilter === cat.id
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/70'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        categoryFilter === cat.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick in-modal search input */}
            <div className="relative min-w-[160px] sm:w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="랭킹 내 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#8B1D24]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Ranking List Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-gray-50/70">
          {filteredAndSortedStores.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-4xl mb-2">🔍</div>
              <h4 className="font-extrabold text-sm text-gray-800">조건에 맞는 제휴 매장이 없습니다</h4>
              <p className="text-xs text-gray-500 mt-1">
                {selectedCollege} 제휴 매장이 아니거나 검색어 조건에 일치하지 않습니다.
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setSearchQuery('');
                  setCollegeScope('all');
                }}
                className="mt-3 px-4 py-1.5 bg-[#8B1D24] text-white text-xs font-bold rounded-xl"
              >
                전체 단과대 매장 보기
              </button>
            </div>
          ) : (
            filteredAndSortedStores.map((store, index) => {
              const dist = getDistanceFromGate(store.lat, store.lng);
              const walkMinutes = Math.max(1, Math.round(dist / 75)); // 75m/min walking speed
              const badgeInfo = getCollegeBadgeInfo(store, selectedCollege);

              // Rank Medals styling
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rankBadgeStyle = 'bg-gray-100 text-gray-700 border-gray-200';
              let medalIcon = null;
              let cardBorder = 'border-gray-200/90 hover:border-[#8B1D24]';

              if (isFirst) {
                rankBadgeStyle =
                  'bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-950 font-black shadow-sm ring-2 ring-yellow-300/80';
                medalIcon = '🥇 1위';
                cardBorder = 'border-amber-300 bg-amber-50/20 shadow-xs hover:border-amber-500';
              } else if (isSecond) {
                rankBadgeStyle =
                  'bg-gradient-to-r from-slate-200 to-gray-300 text-slate-800 font-black shadow-sm ring-2 ring-slate-300/80';
                medalIcon = '🥈 2위';
                cardBorder = 'border-slate-300 bg-slate-50/30 hover:border-slate-400';
              } else if (isThird) {
                rankBadgeStyle =
                  'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black shadow-sm ring-2 ring-amber-400/80';
                medalIcon = '🥉 3위';
                cardBorder = 'border-amber-200 hover:border-amber-400';
              }

              return (
                <div
                  key={store.id}
                  id={`ranking-card-${store.id}`}
                  onClick={() => {
                    onClose();
                    onSelectStore(store);
                  }}
                  className={`bg-white p-4 sm:p-4.5 rounded-2xl border ${cardBorder} shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3`}
                >
                  {/* Top Header Row of Card: Rank + Image + Name + Category + Badges */}
                  <div className="flex items-start gap-3.5">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 border ${rankBadgeStyle}`}
                      >
                        {index + 1}
                      </div>
                      {isFirst && <span className="text-[10px] font-black text-amber-700 mt-1">BEST</span>}
                    </div>

                    {/* Store Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-gray-100">
                      <img
                        src={store.img}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <span className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                        {store.category.split('/')[0].trim()}
                      </span>
                    </div>

                    {/* Store Title & Highlight Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-gray-900 group-hover:text-[#8B1D24] transition-colors leading-snug break-words">
                              {store.name}
                            </h4>
                            {medalIcon && (
                              <span className="text-[11px] font-extrabold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-200">
                                {medalIcon}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeInfo.badgeClass}`}>
                              {badgeInfo.shortLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{store.category}</p>
                        </div>

                        {/* Top metric pill based on activeTab */}
                        <div className="shrink-0 text-right">
                          {activeTab === 'popular' && (
                            <div className="bg-red-50 text-[#8B1D24] border border-red-200/80 px-2.5 py-1 rounded-xl text-center">
                              <span className="block text-[9px] font-bold text-gray-500">인기 지수</span>
                              <span className="text-xs sm:text-sm font-black">🔥 {store.popularScore || 95}점</span>
                            </div>
                          )}
                          {activeTab === 'discount' && (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-xl text-center">
                              <span className="block text-[9px] font-bold text-gray-500">혜택 만족도</span>
                              <span className="text-xs sm:text-sm font-black">💸 {store.discountScore}%</span>
                            </div>
                          )}
                          {activeTab === 'nearest' && (
                            <div className="bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-xl text-center">
                              <span className="block text-[9px] font-bold text-gray-500">정문 기준</span>
                              <span className="text-xs sm:text-sm font-black">🚶 도보 {walkMinutes}분</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Distance and address info */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1 font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-[#8B1D24]" />
                          정문에서 {dist > 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`} (도보 약 {walkMinutes}분)
                        </span>
                        {store.estimatedSaving && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/50">
                            💰 예상 절약: {store.estimatedSaving}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Highlighted Full Benefit Box */}
                  <div className="bg-red-50/90 border border-red-200/80 p-3 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#8B1D24]">
                      <Gift className="w-3.5 h-3.5 text-[#8B1D24]" />
                      <span>경희대 학우 단독 제휴 혜택</span>
                    </div>
                    <div className="text-xs font-bold text-[#8B1D24] leading-relaxed whitespace-pre-line bg-white/70 p-2.5 rounded-lg border border-red-100">
                      {store.benefit}
                    </div>
                  </div>

                  {/* Bottom Store Details & Tags */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                    <p className="text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-1">{store.desc}</p>
                    <div className="flex items-center gap-1 text-[#8B1D24] font-black shrink-0 group-hover:translate-x-0.5 transition-transform">
                      <span>지도에서 위치보기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
