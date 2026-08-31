import React, { useState } from 'react';
import { Store, KyungHeeCollege } from '../types';
import { getCollegeBadgeInfo } from '../utils/collegeAffiliation';
import { X, MapPin, Phone, Clock, Gift, Share2, Navigation, Check, ExternalLink, GraduationCap, Building2, CalendarDays } from 'lucide-react';

interface StoreDetailModalProps {
  store: Store | null;
  onClose: () => void;
  currentCollege?: KyungHeeCollege | null;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({ store, onClose, currentCollege }) => {
  const [copied, setCopied] = useState(false);

  if (!store) return null;

  const badgeInfo = getCollegeBadgeInfo(store, currentCollege);

  const handleCopyBenefit = () => {
    const text = `[경희대학교 제휴 혜택]\n매장: ${store.name}\n기간: ${store.period || '제휴 기간 확인 필요'}\n혜택: ${store.benefit}\n주소: ${store.addr}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[460px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Image */}
        <div className="relative w-full h-[180px] bg-gray-900 shrink-0">
          <img
            src={store.img}
            alt={store.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
            <span className="bg-[#8B1D24] text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow">
              {store.category}
            </span>
            <span className="bg-black/60 backdrop-blur-xs text-yellow-300 text-[11px] font-bold px-2 py-0.5 rounded-lg">
              ★ 혜택만족도 {store.discountScore}%
            </span>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-white">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}>
                {badgeInfo.label}
              </span>
              {store.estimatedSaving && (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  예상 절약 {store.estimatedSaving}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{store.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8B1D24] shrink-0" />
              <span>{store.addr}</span>
            </p>
          </div>

          {/* College Partnership Breakdown Box */}
          <div className="bg-gray-50 border border-gray-200/90 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <GraduationCap className="w-4 h-4 text-[#8B1D24]" />
              <span>제휴 적용 단과대학</span>
            </div>
            {store.isAllColleges ? (
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
                🏛️ <strong>경희대학교 전체 단과대학 공통 제휴</strong> (모든 학우 동일 혜택 적용)
              </p>
            ) : (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {store.colleges.map((c) => (
                    <span
                      key={c}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        c === currentCollege
                          ? 'bg-[#8B1D24] text-white border-[#8B1D24]'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {c} {c === currentCollege && '✓'}
                    </span>
                  ))}
                </div>
                {!badgeInfo.isAffiliatedWithCurrent && currentCollege && (
                  <p className="text-[10px] text-amber-700 font-semibold mt-1">
                    ⚠️ 안내: 본 매장은 <strong>{currentCollege}</strong> 학생회와는 별도 제휴되지 않은 매장입니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
            {store.desc}
          </div>

          {/* Highlighted Benefit Box */}
          <div className="bg-red-50/90 border border-red-200 text-[#8B1D24] p-3.5 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1.5">
                <Gift className="w-4 h-4" />
                경희대학교 학우 제휴 혜택
              </span>
              <button
                onClick={handleCopyBenefit}
                className="text-[11px] font-bold bg-white/80 hover:bg-white text-[#8B1D24] px-2 py-0.5 rounded-md border border-red-200 flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                <span>{copied ? '복사됨!' : '혜택 복사'}</span>
              </button>
            </div>
            <p className="text-xs font-bold leading-relaxed whitespace-pre-line bg-white/60 p-2.5 rounded-xl border border-red-100">
              {store.benefit}
            </p>
            {store.period && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8B1D24] bg-white/80 px-2.5 py-1.5 rounded-lg border border-red-100">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                <span>제휴 기간 {store.period}</span>
              </div>
            )}
            <p className="text-[10px] text-gray-500 font-medium">
              💡 결제 전 학생증(또는 모바일 학생증)을 제시해 주세요.
              {store.sourceHandle ? ` · 출처 @${store.sourceHandle}` : ''}
            </p>
          </div>

          {/* Extra Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-700 font-semibold transition-colors"
              >
                <Phone className="w-4 h-4 text-[#8B1D24]" />
                <span className="truncate">{store.phone}</span>
              </a>
            )}
            {store.hours && (
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-gray-700 font-semibold">
                <Clock className="w-4 h-4 text-[#8B1D24]" />
                <span className="truncate">{store.hours}</span>
              </div>
            )}
          </div>

          {/* Map links */}
          <div className="flex gap-2 pt-1">
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(store.name)},${store.lat},${store.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 text-center bg-[#FEE500] hover:bg-[#ebce00] text-[#191919] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>카카오맵 길찾기</span>
            </a>
            <a
              href={`https://map.naver.com/p/search/${encodeURIComponent(store.name)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 text-center bg-[#03C75A] hover:bg-[#02b350] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>네이버 상세 검색</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
