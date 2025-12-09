import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeoButton } from '../neo-button';

interface GameLayoutProps {
  children: ReactNode;
  onStart?: () => void;
  onRestart?: () => void;
  isGameStarted: boolean;
  isGameEnded: boolean;
  gameTitle: string;
  gameIcon?: string;
}

export function GameLayout({
  children,
  onStart,
  onRestart,
  isGameStarted,
  isGameEnded,
  gameTitle,
  gameIcon = '🎮',
}: GameLayoutProps) {
  const navigate = useNavigate();

  // 게임 시작 전 메인 화면
  if (!isGameStarted) {
    return (
      <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="text-7xl mb-4">{gameIcon}</div>
            <h1 className="font-heading text-3xl">{gameTitle}</h1>

            {children}

            <div className="space-y-3 pt-4">
              {onStart && (
                <button
                  onClick={onStart}
                  className="w-full py-4 bg-primary border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <span className="font-heading text-xl">시작하기</span>
                </button>
              )}
              <button
                onClick={() => navigate('/games')}
                className="w-full py-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <span className="font-bold">← 나가기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 게임 플레이 중
  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* 다시하기 버튼 (게임 종료 시) */}
      {isGameEnded && onRestart && (
        <div className="absolute top-2 right-2 z-50">
          <button
            onClick={onRestart}
            className="px-3 py-1.5 bg-primary border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span className="text-sm font-bold">다시하기</span>
          </button>
        </div>
      )}

      {/* 게임 컨텐츠 */}
      <div className="flex-1 overflow-hidden p-3">
        {children}
      </div>
    </div>
  );
}
