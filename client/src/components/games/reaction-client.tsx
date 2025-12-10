import { useEffect, useRef, useState } from "react";
import { submitGameScoreAction } from "../../lib/actions";

const GAME_ID = "reaction";
const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 550;

type Ball = {
  id: number;
  x: number;
  y: number;
  size: number;
  ttl: number;
  color: string;
  createdAt: number;
};

function randomBall(): Ball {
  const size = Math.random() * 50 + 30;
  return {
    id: Date.now() + Math.floor(Math.random() * 10000),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size,
    ttl: 3500 + Math.random() * 2500,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    createdAt: Date.now(),
  };
}

export function ReactionClient({
  leaderboard,
  gameStarted,
  onGameEnd,
  locked = false,
}: {
  leaderboard: any[];
  gameStarted: boolean;
  onGameEnd?: (score: number) => void;
  locked?: boolean;
}) {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const scoreRef = useRef(0);
  const poppedRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    poppedRef.current = popped;
  }, [popped]);

  const startGame = () => {
    if (locked) return;
    setBalls([]);
    setScore(0);
    setPopped(0);
    setTimeLeft(GAME_DURATION);
    setRunning(true);
    setEnded(false);
  };

  useEffect(() => {
    if (gameStarted) {
      startGame();
    } else {
      setRunning(false);
    }
  }, [gameStarted, locked]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return parseFloat((t - 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const spawner = setInterval(() => {
      setBalls((prev) => {
        const now = Date.now();
        const alive = prev.filter((b) => now - b.createdAt < b.ttl);
        return [...alive, randomBall()];
      });
    }, SPAWN_INTERVAL);
    return () => clearInterval(spawner);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const cleanup = setInterval(() => {
      const now = Date.now();
      setBalls((prev) => prev.filter((b) => now - b.createdAt < b.ttl));
    }, 300);
    return () => clearInterval(cleanup);
  }, [running]);

  const popBall = (id: number) => {
    if (!running) return;
    setBalls((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 120);
    setPopped((p) => p + 1);
  };

  const finishGame = async () => {
    setRunning(false);
    setEnded(true);
    const finalScore = scoreRef.current;
    await submitGameScoreAction(GAME_ID, finalScore, undefined, undefined, {
      popped: poppedRef.current,
      duration: GAME_DURATION,
    });
    onGameEnd?.(finalScore);
  };

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          화면 곳곳에 나타나는 풍선을 빠르게 터뜨려 점수를 쌓아보세요!<br />
          제한 시간 {GAME_DURATION}초 동안 몇 개를 터뜨릴 수 있을까요?
        </p>
        {locked && (
          <div className="text-center text-xs text-red-600 font-bold">
            로그인 후 플레이할 수 있습니다.
          </div>
        )}

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
                  {row.meta?.popped ? `${row.meta.popped}개` : ""}
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
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">남은 시간</div>
          <div className="font-heading text-2xl">{timeLeft.toFixed(1)}s</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">점수</div>
          <div className="font-heading text-2xl">{score}</div>
        </div>
      </div>

      <div className="relative flex-1 border-3 border-black bg-white overflow-hidden rounded-xl" onClick={() => running || ended ? undefined : startGame()}>
        {balls.map((ball) => (
          <button
            key={ball.id}
            onClick={() => popBall(ball.id)}
            className="absolute rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 transition-transform"
            style={{
              width: ball.size,
              height: ball.size,
              backgroundColor: ball.color,
              left: `${ball.x}%`,
              top: `${ball.y}%`,
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
        {ended && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-2">
            <div className="font-heading text-2xl">시간 종료!</div>
            <div className="text-sm">터뜨린 풍선 {poppedRef.current}개</div>
          </div>
        )}
      </div>
    </div>
  );
}
