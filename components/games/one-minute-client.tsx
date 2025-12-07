"use client";

import { NeoButton } from "@/components/neo-button";
import { submitGameScoreAction } from "@/lib/actions";
import { useEffect, useState } from "react";

interface OneMinuteClientProps {
  leaderboard: any[];
}

const GAME_ID = "one-minute";
const TARGET_MS = 10000;

export function OneMinuteClient({ leaderboard }: OneMinuteClientProps) {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center gap-2">
        <p className="text-sm text-muted-foreground">
          버튼을 한 번씩 눌러 10.000초에 가장 가깝게 맞춰보세요. 타이머는 숨겨집니다.
        </p>
        <p className="text-xs text-muted-foreground">시작 → 동일 버튼으로 정지</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <button
            onClick={isRunning ? handleStop : handleStart}
            className="relative w-44 h-44 rounded-full border-4 border-black bg-red-500 text-white font-heading text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] transition-all"
          >
            <span className="absolute inset-0 rounded-full bg-red-600 opacity-30 blur-md" />
            <span className="relative z-10">{isRunning ? "정지" : "시작"}</span>
          </button>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground text-center">
          <div>목표: 10.000초</div>
          {lastScore !== null && (
            <>
              <div className="font-heading text-2xl text-foreground">
                점수 {lastScore} / 오차 {Math.round(lastDiff ?? 0)}ms
              </div>
              <div className="text-xs">측정 시간 {(elapsed / 1000).toFixed(3)}초</div>
            </>
          )}
          {isRunning && <div className="text-xs text-primary font-bold">측정 중... 버튼을 눌러 정지</div>}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-xl mb-2">리더보드 (Top 20)</h3>
        <div className="space-y-2">
          {leaderboard.map((row, idx) => (
            <div key={row.id} className="flex items-center gap-3 bg-muted p-3 border border-black/20">
              <div className="font-bold w-8 text-center">{idx + 1}</div>
              <div className="flex-1">
                <div className="font-heading text-lg">점수 {row.score}</div>
                <div className="text-xs text-muted-foreground">
                  {row.meta?.elapsed_ms ? `${(row.meta.elapsed_ms / 1000).toFixed(3)}초` : ""}
                  {row.meta?.diff_ms !== undefined ? ` • 오차 ${row.meta.diff_ms}ms` : ""}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString("ko-KR")}
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && <p className="text-sm text-muted-foreground">아직 기록이 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}
