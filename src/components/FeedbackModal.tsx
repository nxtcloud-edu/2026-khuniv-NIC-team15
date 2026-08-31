import React, { useEffect, useState } from 'react';
import { FeedbackItem } from '../types';
import { X, Send, ThumbsUp, Heart, Sparkles, MessageSquarePlus } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [storeName, setStoreName] = useState('');
  const [reason, setReason] = useState('');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success && data.items) {
        setFeedbackList(data.items);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchFeedback();
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackList(data.items);
        setStoreName('');
        setReason('');
        setSuccessMsg('💌 학우님의 소중한 제휴 희망 매장이 등록되었습니다!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}/vote`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedbackList(data.items);
      }
    } catch (_) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[420px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#8B1D24] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💌</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                제휴 희망 매장 건의함
              </h3>
              <p className="text-[11px] text-white/80">"이 식당도 제휴 맺어주세요!" 자유롭게 남겨주세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form and List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <MessageSquarePlus className="w-4 h-4 text-[#8B1D24]" />
              <span>새로운 제휴처 제안하기</span>
            </div>

            <div>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="희망 매장명 (예: 서브웨이 영통점, 엽떡)"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#8B1D24]/20 focus:border-[#8B1D24]"
              />
            </div>

            <div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="희망 혜택이나 이유 (예: 음료 무료나 10% 할인 원해요!)"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#8B1D24]/20 focus:border-[#8B1D24] resize-none"
              />
            </div>

            {successMsg && (
              <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!storeName.trim() || isSubmitting}
              className="w-full py-2 bg-[#8B1D24] hover:bg-[#72151b] disabled:bg-gray-300 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>제휴 의견 등록하기</span>
            </button>
          </form>

          {/* Existing Student Proposals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600 px-1">
              <span>학우들이 가장 많이 제안한 곳 🔥</span>
              <span className="text-[11px] text-gray-400">실시간 반영</span>
            </div>

            <div className="space-y-2">
              {feedbackList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-gray-900 truncate">
                        {item.storeName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {item.createdAt}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-[11px] text-gray-600 truncate mt-0.5">
                        "{item.reason}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleVote(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-[#8B1D24] text-[#8B1D24] hover:text-white rounded-xl text-[11px] font-bold transition-all border border-red-200 shrink-0 active:scale-95"
                    title="나도 이 매장 제휴 찬성!"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{item.votes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
