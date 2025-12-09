import { NeoButton } from "../neo-button";
import { submitGameScoreAction } from "../../lib/actions";
import { useEffect, useState } from "react";

interface TenSecondsClientProps {
  leaderboard: any[];
  gameStarted?: boolean;
}

const GAME_ID = "ten-seconds";
const TARGET_MS = 10000;

export function TenSecondsClient({ leaderboard, gameStarted }: TenSecondsClientProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastDiff, setLastDiff] = useState<number | null>(null);

  useEffect(() => {
    let raf: number;
    if (isRunning && startTime) {
      const tick = () => {
        setElapsed(performance.now() - startTime);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(raf);
  }, [isRunning, startTime]);

  const handleStart = () => {
    setStartTime(performance.now());
    setElapsed(0);
    setIsRunning(true);
    setLastScore(null);
    setLastDiff(null);
  };

  const handleStop = async () => {
    if (!startTime) return;
    const finalElapsed = performance.now() - startTime;
    setIsRunning(false);
    setElapsed(finalElapsed);

    const diff = Math.abs(finalElapsed - TARGET_MS);
    const score = Math.max(0, 100000 - Math.round(diff));
    setLastScore(score);
    setLastDiff(diff);

    await submitGameScoreAction(GAME_ID, score, undefined, undefined, {
      elapsed_ms: Math.round(finalElapsed),
      diff_ms: Math.round(diff),
    });
  };

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          버튼을 눌러 시작하고, 정확히 10.000초에 다시 버튼을 눌러보세요!<br/>
          타이머는 숨겨져 있습니다. 당신의 시간 감각은?
        </p>

        <div className="bg-muted/50 border-2 border-black p-3 max-h-[250px] overflow-y-auto">
          <h3 className="font-heading text-base mb-2">🏆 리더보드</h3>
          <div className="space-y-1.5">
            {leaderboard.slice(0, 8).map((row, idx) => (
              <div key={row.id} className="flex items-center gap-2 bg-white p-2 border border-black/20 text-sm">
                <div className="font-bold w-6 text-center text-xs">{idx + 1}</div>
                <div className="flex-1">
                  <div className="font-heading text-sm">{row.score}점</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.meta?.diff_ms !== undefined ? `오차 ${row.meta.diff_ms}ms` : ""}
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-xs text-muted-foreground py-2">아직 기록이 없습니다.</p>}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <button
            onClick={isRunning ? handleStop : handleStart}
            className="relative w-56 h-56 rounded-full border-4 border-black bg-red-500 text-white font-heading text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] transition-all"
          >
            <span className="absolute inset-0 rounded-full bg-red-600 opacity-30 blur-md" />
            <span className="relative z-10">{isRunning ? "정지!" : "시작"}</span>
          </button>
        </div>
        <div className="space-y-2 text-center">
          <div className="text-sm text-muted-foreground">목표: 10.000초</div>
          {lastScore !== null && (
            <>
              <div className="font-heading text-3xl text-foreground">
                {lastScore}점
              </div>
              <div className="text-sm text-muted-foreground">
                오차: {Math.round(lastDiff ?? 0)}ms
              </div>
              <div className="text-xs text-muted-foreground">
                측정: {(elapsed / 1000).toFixed(3)}초
              </div>
            </>
          )}
          {isRunning && <div className="text-sm text-primary font-bold animate-pulse">⏱️ 측정 중...</div>}
        </div>
      </div>
    </div>
  );
}
