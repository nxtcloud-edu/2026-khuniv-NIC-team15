import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Store } from '../types';
import { RefreshCw, X, Sparkles, MapPin, Trophy } from 'lucide-react';

interface LadderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onSelectStore: (store: Store) => void;
}

interface Rung {
  fromCol: number;
  toCol: number;
  y: number;
}

export const LadderModal: React.FC<LadderModalProps> = ({
  isOpen,
  onClose,
  stores,
  onSelectStore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ladderStores, setLadderStores] = useState<Store[]>([]);
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [winnerStore, setWinnerStore] = useState<Store | null>(null);
  const [statusText, setStatusText] = useState('출발 번호(1~4)를 선택하고 사다리를 타보세요!');
  const animationFrameRef = useRef<number | null>(null);

  // Initialize candidates & ladder
  const initLadder = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRunning(false);
    setWinnerStore(null);
    setStatusText('출발 번호(1~4)를 선택하고 사다리를 타보세요!');

    // Pick 4 random food stores
    const foods = stores.filter((s) => s.type === 'food' || s.type === 'cafe');
    const shuffled = [...foods].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 4);
    setLadderStores(chosen);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const cols = 4;
    const topY = 45;
    const bottomY = canvas.height - 45;

    // Generate random horizontal rungs
    const newRungs: Rung[] = [];
    for (let i = 0; i < cols - 1; i++) {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < count; j++) {
        const y = topY + 30 + Math.random() * (bottomY - topY - 60);
        newRungs.push({ fromCol: i, toCol: i + 1, y });
      }
    }
    setRungs(newRungs);

    drawStaticLadder(chosen, newRungs);
  };

  const drawStaticLadder = (items: Store[], rungList: Rung[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cols = 4;
    const paddingX = 42;
    const stepX = (canvas.width - paddingX * 2) / (cols - 1);
    const topY = 45;
    const bottomY = canvas.height - 45;

    // Draw vertical lines
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Pretendard, sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i < cols; i++) {
      const x = paddingX + i * stepX;
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.stroke();

      // Top number pill
      ctx.fillStyle = selectedCol === i ? '#8B1D24' : '#64748b';
      ctx.beginPath();
      ctx.roundRect(x - 22, topY - 32, 44, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${i + 1}번`, x, topY - 16);

      // Bottom store name
      if (items[i]) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Pretendard, sans-serif';
        const name = items[i].name.length > 5 ? items[i].name.slice(0, 5) + '..' : items[i].name;
        ctx.fillText(name, x, bottomY + 22);
      }
    }

    // Draw horizontal rungs
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#cbd5e1';
    rungList.forEach((r) => {
      const x1 = paddingX + r.fromCol * stepX;
      const x2 = paddingX + r.toCol * stepX;
      ctx.beginPath();
      ctx.moveTo(x1, r.y);
      ctx.lineTo(x2, r.y);
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(initLadder, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (ladderStores.length > 0 && rungs.length > 0) {
      drawStaticLadder(ladderStores, rungs);
    }
  }, [selectedCol]);

  // Start animated run
  const runLadder = () => {
    if (isRunning || ladderStores.length < 4) return;
    setIsRunning(true);
    setWinnerStore(null);
    setStatusText(`🏃 ${selectedCol + 1}번 출발선에서 사다리를 타고 내려갑니다...!`);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 4;
    const paddingX = 42;
    const stepX = (canvas.width - paddingX * 2) / (cols - 1);
    const topY = 45;
    const bottomY = canvas.height - 45;

    let currentCol = selectedCol;
    let currentX = paddingX + currentCol * stepX;
    let currentY = topY;

    const pathPoints: { x: number; y: number }[] = [{ x: currentX, y: currentY }];
    const sortedRungs = [...rungs].sort((a, b) => a.y - b.y);

    while (currentY < bottomY) {
      const nextRung = sortedRungs.find(
        (r) => r.y > currentY && (r.fromCol === currentCol || r.toCol === currentCol)
      );

      if (nextRung) {
        currentY = nextRung.y;
        pathPoints.push({ x: currentX, y: currentY });

        currentCol = nextRung.fromCol === currentCol ? nextRung.toCol : nextRung.fromCol;
        currentX = paddingX + currentCol * stepX;
        pathPoints.push({ x: currentX, y: currentY });
      } else {
        currentY = bottomY;
        pathPoints.push({ x: currentX, y: currentY });
      }
    }

    const finalWinner = ladderStores[currentCol];

    let ptIdx = 0;
    let progress = 0;

    const animate = () => {
      if (ptIdx >= pathPoints.length - 1) {
        setIsRunning(false);
        setWinnerStore(finalWinner);
        setStatusText(`🎉 오늘의 추천 당첨: [${finalWinner.name}]`);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8B1D24', '#FEE500', '#2563EB', '#10B981'],
          });
        } catch (_) {}

        return;
      }

      const p1 = pathPoints[ptIdx];
      const p2 = pathPoints[ptIdx + 1];

      const segX = p1.x + (p2.x - p1.x) * progress;
      const segY = p1.y + (p2.y - p1.y) * progress;

      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8B1D24';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(segX, segY);
      ctx.stroke();

      progress += 0.09;
      if (progress >= 1) {
        progress = 0;
        ptIdx++;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-[420px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#8B1D24] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎲</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                오늘 뭐 먹지? 사다리 타기
              </h3>
              <p className="text-[11px] text-white/80">경희대 제휴 맛집 랜덤 추천</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={initLadder}
              disabled={isRunning}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white disabled:opacity-50"
              title="후보 매장 다시 섞기"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Start column selector buttons */}
        <div className="px-4 pt-3 pb-1 bg-gray-50 flex items-center justify-between border-b border-gray-100">
          <span className="text-[11px] font-bold text-gray-500">내 출발 번호 선택:</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((colIdx) => (
              <button
                key={colIdx}
                disabled={isRunning}
                onClick={() => setSelectedCol(colIdx)}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  selectedCol === colIdx
                    ? 'bg-[#8B1D24] text-white shadow-sm scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {colIdx + 1}번
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 bg-white">
          <canvas
            ref={canvasRef}
            width={340}
            height={330}
            className="rounded-2xl border border-gray-100 shadow-inner bg-slate-50/50"
          />
        </div>

        {/* Winner display card or Start button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2.5">
          <div className="text-center text-xs font-bold text-[#8B1D24] min-h-[22px]">
            {statusText}
          </div>

          {winnerStore ? (
            <div className="bg-white p-3 rounded-2xl border-2 border-[#8B1D24] shadow-md flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
              <img
                src={winnerStore.img}
                alt={winnerStore.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-gray-900 truncate">
                    {winnerStore.name}
                  </span>
                  <span className="text-[10px] bg-red-100 text-[#8B1D24] font-bold px-1.5 py-0.5 rounded">
                    당첨
                  </span>
                </div>
                <p className="text-[11px] text-[#8B1D24] font-semibold truncate mt-0.5">
                  🎁 {winnerStore.benefit.split('\n')[0]}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{winnerStore.category}</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onSelectStore(winnerStore);
                }}
                className="bg-[#8B1D24] hover:bg-[#72151b] text-white px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 shadow-sm flex items-center gap-1 active:scale-95 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>지도 보기</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={initLadder}
                disabled={isRunning}
                className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                다시 섞기
              </button>
              <button
                onClick={runLadder}
                disabled={isRunning}
                className="flex-1 py-2.5 bg-[#8B1D24] hover:bg-[#72151b] text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>사다리 타기 출발! 🚀</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
