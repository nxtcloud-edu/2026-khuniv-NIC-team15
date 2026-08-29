import React, { useState } from 'react';
import { X, Calculator, PiggyBank, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

interface SavingsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsCalculatorModal: React.FC<SavingsCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mealsPerWeek, setMealsPerWeek] = useState(4); // Average meal savings: 2,500 KRW
  const [cafesPerWeek, setCafesPerWeek] = useState(5); // Average cafe savings: 1,500 KRW
  const [drinksPerMonth, setDrinksPerMonth] = useState(3); // Average pub savings: 8,000 KRW
  const [fitnessBeauty, setFitnessBeauty] = useState(true); // 50,000 KRW semester package savings

  if (!isOpen) return null;

  // 1 semester = 16 weeks (~4 months)
  const mealSavings = mealsPerWeek * 2500 * 16;
  const cafeSavings = cafesPerWeek * 1500 * 16;
  const drinkSavings = drinksPerMonth * 8000 * 4;
  const fitSavings = fitnessBeauty ? 60000 : 0;
  const totalSemesterSavings = mealSavings + cafeSavings + drinkSavings + fitSavings;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[420px] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#8B1D24] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                경희대 학우 혜택 절약 계산기
              </h3>
              <p className="text-[11px] text-white/80">한 학기 동안 제휴 혜택으로 얼마를 아낄 수 있을까요?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto bg-gray-50 flex-1">
          {/* Estimated Total Result Box */}
          <div className="bg-gradient-to-br from-[#8B1D24] to-[#601217] text-white p-4 rounded-2xl shadow-md text-center flex flex-col items-center gap-1">
            <span className="text-xs text-white/80 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              학우님의 예상 1학기 총 절약 금액
            </span>
            <div className="text-2xl sm:text-3xl font-black text-yellow-300 tracking-tight">
              {totalSemesterSavings.toLocaleString()}원
            </div>
            <p className="text-[11px] text-white/80 mt-0.5">
              전공 서적 약 {(totalSemesterSavings / 35000).toFixed(1)}권 or 치킨{' '}
              {Math.floor(totalSemesterSavings / 22000)}마리 상당의 혜택! 🎉
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3.5 text-xs font-bold text-gray-800 shadow-xs">
            {/* Meals */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>🍽️ 제휴 식당 방문 (주당 {mealsPerWeek}회)</span>
                <span className="text-[#8B1D24]">{mealSavings.toLocaleString()}원</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                value={mealsPerWeek}
                onChange={(e) => setMealsPerWeek(Number(e.target.value))}
                className="w-full accent-[#8B1D24] cursor-pointer"
              />
            </div>

            {/* Cafes */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>☕ 제휴 카페/디저트 (주당 {cafesPerWeek}회)</span>
                <span className="text-[#8B1D24]">{cafeSavings.toLocaleString()}원</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                value={cafesPerWeek}
                onChange={(e) => setCafesPerWeek(Number(e.target.value))}
                className="w-full accent-[#8B1D24] cursor-pointer"
              />
            </div>

            {/* Drinks */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>🍺 제휴 주점/회식 (월당 {drinksPerMonth}회)</span>
                <span className="text-[#8B1D24]">{drinkSavings.toLocaleString()}원</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={drinksPerMonth}
                onChange={(e) => setDrinksPerMonth(Number(e.target.value))}
                className="w-full accent-[#8B1D24] cursor-pointer"
              />
            </div>

            {/* Gym/Beauty */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fitCheck"
                  checked={fitnessBeauty}
                  onChange={(e) => setFitnessBeauty(e.target.checked)}
                  className="w-4 h-4 accent-[#8B1D24] rounded"
                />
                <label htmlFor="fitCheck" className="cursor-pointer">
                  💪 헬스장/헤어/사진 제휴 이용
                </label>
              </div>
              <span className="text-[#8B1D24]">{fitSavings.toLocaleString()}원</span>
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-200/80 p-3 rounded-2xl text-[11px] text-[#8B1D24] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">
              제휴 혜택은 결제 시 경희대학교 학생증(모바일 학생증 가능)을 제시하시면 상시 적용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
