import { useEffect, useMemo, useState } from "react";
import { submitGameScoreAction } from "../../lib/actions";
import { NeoButton } from "../neo-button";

const GAME_ID = "runner";
const WIDTH = 320;
const HEIGHT = 200;

type Obstacle = { x: number; y: number; width: number; height: number };

export function RunnerClient({ leaderboard, gameStarted, onGameEnd }: { leaderboard: any[]; gameStarted?: boolean; onGameEnd?: () => void }) {
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(150);
  const [velY, setVelY] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const gravity = 0.8;
  const jumpPower = -10;
  const speed = useMemo(() => 3 + Math.min(4, score / 5000), [score]);

  useEffect(() => {
    if (!isRunning) return;
    const loop = setInterval(() => {
      // Move obstacles
      setObstacles((obs) =>
        obs
          .map((o) => ({ ...o, x: o.x - speed }))
          .filter((o) => o.x + o.width > 0)
      );

      // Spawn obstacle
      if (Math.random() < 0.04) {
        setObstacles((obs) => [
          ...obs,
          { x: WIDTH + 20, y: 160, width: 20 + Math.random() * 20, height: 20 + Math.random() * 10 },
        ]);
      }

      // Physics
      setPlayerY((y) => Math.min(160, y + velY));
      setVelY((v) => Math.min(12, v + gravity));

      // Collision check
      const playerRect = { x: playerX, y: playerY, w: 16, h: 20 };
      let hit = false;
      obstacles.forEach((o) => {
        const overlap =
          playerRect.x < o.x + o.width &&
          playerRect.x + playerRect.w > o.x &&
          playerRect.y < o.y + o.height &&
          playerRect.y + playerRect.h > o.y;
        if (overlap) hit = true;
      });

      if (hit) {
        endGame();
      } else {
        setScore((s) => s + Math.round(16 * speed));
      }
    }, 16);
    return () => clearInterval(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, speed, obstacles, velY]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isRunning) return;
      if (e.key === "ArrowLeft") {
        setPlayerX((x) => Math.max(0, x - 12));
      } else if (e.key === "ArrowRight") {
        setPlayerX((x) => Math.min(WIDTH - 16, x + 12));
      } else if (e.key === "ArrowUp" || e.key === " " || e.key === "Spacebar") {
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning]);

  const jump = () => {
    setVelY(jumpPower);
  };

  const startGame = () => {
    setPlayerX(50);
    setPlayerY(150);
    setVelY(0);
    setObstacles([]);
    setScore(0);
    setIsRunning(true);
    setStartAt(performance.now());
    setGameOver(false);
  };

  const endGame = async () => {
    setIsRunning(false);
    setGameOver(true);
    const duration = startAt ? performance.now() - startAt : 0;
    await submitGameScoreAction(GAME_ID, score, undefined, undefined, {
      duration_ms: Math.round(duration),
      obstacles: obstacles.length,
    });
    if (onGameEnd) onGameEnd();
  };

  useEffect(() => {
    if (gameStarted && !isRunning && !gameOver) {
      startGame();
    }
  }, [gameStarted]);

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          귀여운 픽셀 고양이와 함께 장애물을 피하며 끝없이 달려보세요!<br/>
          스페이스바 또는 화면 터치로 점프!
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
                  {row.meta?.duration_ms ? `${(row.meta.duration_ms / 1000).toFixed(1)}초` : ""}
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
    <div className="h-full flex flex-col space-y-3">
      <div className="flex-shrink-0 text-center">
        <div className="text-2xl font-heading">점수 {score}</div>
        {gameOver && <div className="text-sm text-muted-foreground">게임 오버!</div>}
      </div>

      <div className="relative border-3 border-black bg-gradient-to-b from-sky-100 to-sky-200 rounded-lg overflow-hidden w-full max-w-xl mx-auto aspect-[16/10]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
          {/* ground */}
          <rect x={0} y={180} width={WIDTH} height={20} fill="#0ea5e9" opacity={0.3} />
          {/* player */}
          <g transform={`translate(${playerX}, ${playerY})`}>
            <rect width={16} height={20} fill="#f43f5e" stroke="#111" strokeWidth={1} rx={3} />
            <circle cx={6} cy={7} r={2} fill="#fff" />
            <circle cx={10} cy={7} r={2} fill="#fff" />
            <rect x={5} y={14} width={6} height={2} fill="#111" />
          </g>
          {/* obstacles */}
          {obstacles.map((o, idx) => (
            <rect key={idx} x={o.x} y={o.y} width={o.width} height={o.height} fill="#111" opacity={0.8} />
          ))}
        </svg>
      </div>

    </div>
  );
}
