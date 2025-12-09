import { useEffect, useRef, useState } from "react";
import { NeoButton } from "../neo-button";
import { submitGameScoreAction } from "../../lib/actions";

const GAME_ID = "reaction";

type Phase = "idle" | "waiting" | "go" | "result";

export function ReactionClient({
  leaderboard,
  gameStarted,
}: {
  leaderboard: any[];
  gameStarted: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("시작을 누르면 준비 상태로 들어갑니다.");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startWaiting = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase("waiting");
    setMessage("곧 신호가 켜집니다. 기다리세요...");
    const delay = 1000 + Math.random() * 2000;
    timeoutRef.current = setTimeout(() => {
      setPhase("go");
      setMessage("지금! 초록색을 탭하세요!");
      setStartTime(performance.now());
    }, delay);
  };

  const handleTap = async () => {
    if (phase === "waiting") {
      // false start
      setMessage("너무 빨랐습니다! 다시 시작하세요.");
      setPhase("result");
      setReactionMs(null);
      return;
    }
    if (phase === "go" && startTime) {
      const end = performance.now();
      const ms = end - startTime;
      setReactionMs(ms);
      setPhase("result");
      setMessage(`반응 속도: ${ms.toFixed(0)}ms`);
      const score = Math.max(0, 100000 - Math.round(ms));
      await submitGameScoreAction(GAME_ID, score, undefined, undefined, { reaction_ms: Math.round(ms) });
      return;
    }
    if (phase === "idle" || phase === "result") {
      startWaiting();
    }
  };

  const bgClass =
    phase === "go"
      ? "bg-green-500"
      : phase === "waiting"
      ? "bg-yellow-400"
      : phase === "result"
      ? "bg-muted"
      : "bg-blue-300";

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          풍선이 나타나면 빠르게 터뜨려보세요!<br/>
          당신의 반응속도는 몇 ms?
        </p>

        {/* Leaderboard */}
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
                  {row.meta?.reaction_ms ? `${row.meta.reaction_ms}ms` : ""}
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
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className={`rounded-2xl border-3 border-black h-full min-h-[300px] flex items-center justify-center text-center ${bgClass}`}>
          <button
            onClick={handleTap}
            className="w-full h-full flex flex-col items-center justify-center font-heading"
          >
            <div className="text-4xl mb-2">
              {phase === "go" ? "🎈" : phase === "waiting" ? "⏳" : phase === "result" ? "🔄" : "▶️"}
            </div>
            <div className="text-2xl">
              {phase === "go" ? "탭!" : phase === "waiting" ? "기다리세요..." : phase === "result" ? "다시 시작" : "시작"}
            </div>
          </button>
        </div>

        <div className="text-center text-sm text-muted-foreground">{message}</div>

        {reactionMs !== null && (
          <div className="text-center p-4 bg-primary/20 border-2 border-black">
            <div className="text-3xl font-heading">
              {reactionMs.toFixed(0)}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
