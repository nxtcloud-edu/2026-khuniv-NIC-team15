import React, { useState, useEffect } from 'react';
import { KHU_COLLEGES, KyungHeeCollege, StudentProfile } from '../types';
import { X, UserCheck, Sparkles, Building2, User, GraduationCap, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile | null;
  onSaveProfile: (profile: StudentProfile) => void;
  isInitialSetup?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  isInitialSetup = false,
}) => {
  const [college, setCollege] = useState<KyungHeeCollege>(currentProfile?.college || '소프트웨어융합대학');
  const [name, setName] = useState(currentProfile?.name || '');
  const [major, setMajor] = useState(currentProfile?.major || '');
  const [studentNumber, setStudentNumber] = useState(currentProfile?.studentNumber || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setCollege(currentProfile.college);
      setName(currentProfile.name);
      setMajor(currentProfile.major || '');
      setStudentNumber(currentProfile.studentNumber || '');
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름 또는 닉네임을 입력해 주세요.');
      return;
    }
    if (!college) {
      setError('소속 단과대학을 선택해 주세요.');
      return;
    }

    const profile: StudentProfile = {
      college,
      name: name.trim(),
      major: major.trim() || undefined,
      studentNumber: studentNumber.trim() || undefined,
    };

    onSaveProfile(profile);
    onClose();
  };

  const handleQuickDemo = () => {
    setCollege('소프트웨어융합대학');
    setName('김경희');
    setMajor('컴퓨터공학과');
    setStudentNumber('24학번');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[460px] max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header with Kyung Hee Branding */}
        <div className="bg-gradient-to-r from-[#8B1D24] via-[#75141b] to-[#590e13] text-white px-6 py-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner border border-white/20">
                🦁
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    {isInitialSetup ? '경희대 학우 정보 입력' : '내 학생 정보 수정'}
                  </h2>
                  <span className="text-[10px] bg-yellow-400 text-red-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                    국제캠퍼스
                  </span>
                </div>
                <p className="text-[11px] text-white/80 mt-0.5 font-medium">
                  {isInitialSetup
                    ? '서비스 이용 전 소속 단과대학과 정보를 입력해 주세요.'
                    : '제휴 혜택 맞춤 추천과 학생증 카드에 반영됩니다.'}
                </p>
              </div>
            </div>

            {!isInitialSetup && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/70">
          {/* Live Mobile Student ID Card Badge Preview */}
          <div className="bg-gradient-to-br from-[#8B1D24] to-[#4e0c10] rounded-2xl p-4 text-white shadow-md relative overflow-hidden border border-red-900/40">
            {/* Watermark Crest */}
            <div className="absolute right-[-10px] bottom-[-15px] text-7xl opacity-10 select-none pointer-events-none">
              🦁
            </div>

            <div className="flex items-center justify-between text-xs text-white/75 font-semibold pb-2.5 border-b border-white/15">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                KYUNG HEE UNIVERSITY
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                제휴 모바일 멤버십
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-yellow-300">
                  {college || '단과대학을 선택해주세요'}
                  {major ? ` · ${major}` : ''}
                </div>
                <div className="text-xl font-black tracking-tight mt-0.5">
                  {name || '경희 학우님'}
                </div>
                <div className="text-[10px] text-white/70 mt-1 font-mono">
                  {studentNumber ? `ID: ${studentNumber}` : '국제캠퍼스 제휴 회원'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/25 flex flex-col items-center justify-center text-center p-1">
                <span className="text-lg">🦁</span>
                <span className="text-[8px] font-black text-yellow-300 leading-none mt-0.5">KHU PASS</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
            {/* 1. 단과대학 선택 (Required) */}
            <div>
              <label htmlFor="college-select" className="block text-xs font-black text-gray-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#8B1D24]" />
                  <span>단과대학 선택 <span className="text-red-500">*</span></span>
                </span>
                <span className="text-[11px] text-[#8B1D24] font-bold">12개 단과대/학부</span>
              </label>

              <div className="relative">
                <select
                  id="college-select"
                  value={college}
                  onChange={(e) => setCollege(e.target.value as KyungHeeCollege)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B1D24] focus:border-transparent transition-all appearance-none cursor-pointer"
                  required
                >
                  {KHU_COLLEGES.map((c) => (
                    <option key={c} value={c} className="font-semibold text-gray-800 py-1">
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                공과대학, 전자정보대학, 소프트웨어융합대학 등 소속 단과대학을 선택해주세요.
              </p>
            </div>

            {/* 2. 이름 / 닉네임 (Required) */}
            <div>
              <label htmlFor="student-name" className="block text-xs font-black text-gray-800 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#8B1D24]" />
                <span>이름 또는 닉네임 <span className="text-red-500">*</span></span>
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="예: 김경희, 쿠키"
                maxLength={20}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B1D24] focus:border-transparent transition-all"
                required
              />
            </div>

            {/* 3. 학과 / 전공 (Optional) & 학번 (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="student-major" className="block text-xs font-black text-gray-800 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#8B1D24]" />
                  <span>학과 / 세부전공 (선택)</span>
                </label>
                <input
                  id="student-major"
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="예: 컴퓨터공학과"
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B1D24] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="student-id" className="block text-xs font-black text-gray-800 mb-1.5 flex items-center gap-1.5">
                  <span className="text-xs">🎫</span>
                  <span>학번 또는 학년 (선택)</span>
                </label>
                <input
                  id="student-id"
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="예: 24학번, 2학년"
                  maxLength={20}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B1D24] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 animate-in fade-in">
                ⚠️ {error}
              </div>
            )}

            {/* Quick Demo Helper */}
            {isInitialSetup && !name && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-500">빠르게 시작하고 싶으신가요?</span>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="text-[11px] text-[#8B1D24] font-black underline hover:text-[#601217] cursor-pointer"
                >
                  ⚡ 예시 데이터로 1초 채우기
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="save-student-profile-btn"
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#8B1D24] to-[#6c1117] hover:from-[#75141b] hover:to-[#570a0f] text-white rounded-xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer mt-2"
            >
              <span>{isInitialSetup ? '경희로드 제휴 지도 시작하기' : '학생 정보 저장하기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
