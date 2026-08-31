import React, { useEffect, useRef, useState } from 'react';
import { Store, ChatMessage, StudentProfile } from '../types';
import { Send, Bot, User, Sparkles, X, RotateCcw, MapPin, Key } from 'lucide-react';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onSelectStore: (store: Store) => void;
  studentProfile?: StudentProfile | null;
}

export const ChatbotModal: React.FC<ChatbotModalProps> = ({
  isOpen,
  onClose,
  stores,
  onSelectStore,
  studentProfile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const greetingName = studentProfile?.name ? `${studentProfile.name} 학우님` : '경희 학우님';
    const collegeText = studentProfile?.college ? `[${studentProfile.college}] ` : '';
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `안녕, ${collegeText}${greetingName}! 🦁\n\n나는 경희대학교 국제캠퍼스 전용 **제휴봇**이야.\n\n"오늘 점심 뭐 먹지?", "10명 단체 회식 어디가 좋아?", "카공하기 좋은 카페 알려줘" 같이 원하는 상황이나 메뉴를 편하게 물어봐줘! 딱 맞는 제휴 혜택을 콕 집어줄게 ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [studentProfile]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Fast local matcher
  const generateLocalReply = (query: string): string => {
    const q = query.toLowerCase();
    let matched: Store[] = [];

    if (q.includes('고기') || q.includes('삼겹') || q.includes('갈비') || q.includes('목살')) {
      matched = stores.filter(
        (s) =>
          s.name.includes('돼지') ||
          s.name.includes('갈비') ||
          s.name.includes('돈들집') ||
          s.name.includes('삼겹') ||
          s.category.includes('고기')
      );
    } else if (q.includes('카페') || q.includes('커피') || q.includes('카공') || q.includes('디저트') || q.includes('팀플')) {
      matched = stores.filter((s) => s.type === 'cafe');
    } else if (q.includes('술') || q.includes('주점') || q.includes('포차') || q.includes('맥주') || q.includes('회식') || q.includes('육회') || q.includes('칵테일')) {
      matched = stores.filter((s) => s.type === 'pub' || s.tags?.includes('단체'));
    } else if (q.includes('혼밥') || q.includes('간단') || q.includes('라멘') || q.includes('덮밥')) {
      matched = stores.filter((s) => s.tags?.includes('혼밥') || s.name.includes('키와마루') || s.name.includes('메가혼밥') || s.name.includes('부리또'));
    } else if (q.includes('운동') || q.includes('헬스') || q.includes('피티') || q.includes('미용') || q.includes('머리') || q.includes('사진')) {
      matched = stores.filter((s) => s.type === 'life');
    } else {
      // General match
      matched = stores.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.benefit || '').toLowerCase().includes(q) ||
          (s.desc || '').toLowerCase().includes(q)
      );
    }

    if (matched.length === 0) {
      matched = stores.slice(0, 3);
    }

    const picks = matched.slice(0, 3);
    let reply = `학우님! 요청하신 조건에 딱 맞는 추천 제휴처를 찾아봤어요 🦁✨\n\n`;

    picks.forEach((s) => {
      reply += `📍 **${s.name}** (${s.category})\n`;
      reply += `🎁 **혜택**: ${(s.benefit || '').replace(/\n/g, ' ')}\n`;
      if (s.period) reply += `📅 **기간**: ${s.period}\n`;
      reply += `💡 **특징**: ${s.desc}\n\n`;
    });

    reply += `👉 *위 매장명을 클릭하시면 지도에서 바로 위치와 길찾기를 확인할 수 있습니다! (학생증 지참 필수 🪪)*`;
    return reply;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          customApiKey: customKey || undefined,
          storeList: stores.map((s) => ({
            name: s.name,
            category: s.category,
            benefit: s.benefit,
            period: s.period,
            desc: s.desc,
            type: s.type,
          })),
        }),
        signal: AbortSignal.timeout(28000),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data.reply) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }
      throw new Error(data?.message || 'API_RESPONSE_NOT_OK');
    } catch {
      let fallbackReply = '죄송해요, 지금은 답변을 만들지 못했어요. 잠시 후 다시 물어봐 주세요 🦁';
      try {
        fallbackReply = generateLocalReply(query);
      } catch {
        // keep default
      }
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: '대화가 초기화되었습니다. 궁금한 제휴 혜택을 언제든 물어보세요! 🦁',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const promptChips = [
    '🥩 가성비 삼겹살/고기구이',
    '☕ 카공/팀플하기 좋은 카페',
    '🍻 10인 이상 단체 회식 장소',
    '🍚 든든하게 혼밥하기 좋은 곳',
    '💪 헬스/PT/미용실 제휴',
  ];

  // Helper to render message with clickable store tags
  const renderMessageContent = (text: string) => {
    // Break into parts and find store names
    const storeNames = stores.map((s) => s.name);
    // Sort store names by length desc to prevent partial substring matches
    storeNames.sort((a, b) => b.length - a.length);

    // Replace store names with custom markers
    let processed = text;

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
        {processed.split('\n').map((line, lIdx) => {
          let lineParts: React.ReactNode[] = [line];

          stores.forEach((store) => {
            const nextParts: React.ReactNode[] = [];
            lineParts.forEach((part) => {
              if (typeof part === 'string' && part.includes(store.name)) {
                const splits = part.split(store.name);
                splits.forEach((split, sIdx) => {
                  if (split) nextParts.push(split);
                  if (sIdx < splits.length - 1) {
                    nextParts.push(
                      <button
                        key={`${store.id}-${lIdx}-${sIdx}`}
                        onClick={() => onSelectStore(store)}
                        className="inline-flex items-center gap-0.5 mx-1 px-1.5 py-0.5 bg-red-100/90 hover:bg-[#8B1D24] text-[#8B1D24] hover:text-white font-extrabold rounded-md text-[11px] transition-all shadow-2xs active:scale-95 cursor-pointer"
                        title="지도에서 매장 위치 보기"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{store.name}</span>
                      </button>
                    );
                  }
                });
              } else {
                nextParts.push(part);
              }
            });
            lineParts = nextParts;
          });

          return <div key={lIdx}>{lineParts}</div>;
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[2500] flex items-end sm:items-center justify-center p-0 sm:p-0">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200/90 w-full sm:w-[380px] h-[85vh] sm:h-[560px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Chat Header */}
        <div className="bg-[#8B1D24] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🦁
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm">경희대 제휴봇 AI</h3>
                <span className="text-[9px] bg-yellow-400 text-red-950 font-black px-1 py-0.2 rounded">
                  24시
                </span>
              </div>
              <p className="text-[10px] text-white/80 font-medium">국제캠퍼스 제휴 맞춤 추천 어시스턴트</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              title="API 키 설정 (선택)"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearChat}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              title="대화 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key accordion */}
        {showKeyInput && (
          <div className="bg-red-50 p-2.5 border-b border-red-100 flex items-center gap-2 text-xs animate-in fade-in">
            <span className="font-bold text-gray-700 shrink-0">API 키:</span>
            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Google AI Studio Gemini API 키 (선택사항)"
              className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs outline-none focus:border-[#8B1D24]"
            />
          </div>
        )}

        {/* Message stream area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#f8f9fb]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-start ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-full bg-[#8B1D24] text-white flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5">
                    🦁
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                    isBot
                      ? 'bg-white text-gray-800 rounded-tl-xs border border-gray-100'
                      : 'bg-[#8B1D24] text-white rounded-tr-xs font-medium'
                  }`}
                >
                  {isBot ? renderMessageContent(msg.text) : msg.text}
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      isBot ? 'text-gray-400' : 'text-white/70'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {!isBot && (
                  <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2 items-start justify-start">
              <div className="w-7 h-7 rounded-full bg-[#8B1D24] text-white flex items-center justify-center text-xs shrink-0">
                🦁
              </div>
              <div className="bg-white text-gray-700 rounded-2xl rounded-tl-xs px-3.5 py-2.5 border border-gray-100 shadow-xs flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#8B1D24] animate-ping" />
                <span className="text-xs font-bold text-gray-600">
                  제휴 매장 정보를 꼼꼼하게 검색 중이에요...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-1.5 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(chip.slice(2))}
              className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-[#8B1D24] hover:border-[#8B1D24]/30 text-gray-700 border border-gray-200 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-2.5 bg-white border-t border-gray-200/80 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="인원수, 메뉴, 목적 등을 편하게 물어보세요!"
            className="flex-1 bg-gray-100 text-gray-900 px-3.5 py-2 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#8B1D24]/30 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isLoading}
            className="bg-[#8B1D24] hover:bg-[#72151b] disabled:bg-gray-300 text-white p-2.5 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
