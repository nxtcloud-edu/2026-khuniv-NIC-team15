import React from 'react';
import { Flame, Percent, MessageSquarePlus, Bot, Sparkles } from 'lucide-react';

interface BottomDockProps {
  onOpenRank: (tab: 'popular' | 'discount') => void;
  onOpenFeedback: () => void;
  onToggleChatbot: () => void;
  isChatOpen: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  onOpenRank,
  onOpenFeedback,
  onToggleChatbot,
  isChatOpen,
}) => {
  return (
    <>
      {/* Bottom Left Dock */}
      <div className="absolute bottom-5 sm:bottom-6 left-3 sm:left-5 z-[1000] flex gap-2 flex-wrap max-w-[85vw] pointer-events-auto">
        <button
          id="dock-btn-popular"
          onClick={() => onOpenRank('popular')}
          className="bg-white/95 hover:bg-white text-gray-800 hover:text-[#8B1D24] px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl border border-gray-200/90 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer backdrop-blur-xs"
        >
          <span className="text-sm">🔥</span>
          <span>인기순</span>
        </button>

        <button
          id="dock-btn-discount"
          onClick={() => onOpenRank('discount')}
          className="bg-white/95 hover:bg-white text-gray-800 hover:text-[#8B1D24] px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl border border-gray-200/90 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer backdrop-blur-xs"
        >
          <span className="text-sm">💸</span>
          <span>할인순</span>
        </button>

        <button
          id="dock-btn-feedback"
          onClick={onOpenFeedback}
          className="bg-[#1f242d] hover:bg-[#11141a] text-white px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-extrabold shadow-lg hover:shadow-xl border border-gray-700 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <span className="text-sm">💡</span>
          <span>의견 남기기</span>
        </button>
      </div>

      {/* Bottom Right AI Chatbot FAB */}
      <div className="absolute bottom-5 sm:bottom-6 right-3 sm:right-6 z-[1000] pointer-events-auto">
        <button
          id="chatbot-fab-button"
          onClick={onToggleChatbot}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#8B1D24] text-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl border-2 border-white transition-all transform hover:scale-105 active:scale-95 relative group ${
            isChatOpen ? 'ring-4 ring-red-400' : ''
          }`}
          title="경희대 제휴봇 AI 열기"
        >
          <span className="text-2xl sm:text-3xl leading-none">🦁</span>
          <span className="text-[9px] font-black text-yellow-300 mt-0.5 tracking-tight">AI 제휴봇</span>
          
          {/* Pulsing indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border border-white"></span>
          </span>
        </button>
      </div>
    </>
  );
};
