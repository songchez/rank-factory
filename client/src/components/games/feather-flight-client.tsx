import { useEffect, useRef, useState } from "react";
import { submitGameScoreAction } from "../../lib/actions";

const GAME_ID = "feather-flight";
const GAME_WIDTH = 360;
const GAME_HEIGHT = 620;
const PIPE_WIDTH = 60;
const GAP_HEIGHT = 150;
const GRAVITY = 900;
const FLAP_FORCE = -320;
const SCROLL_SPEED = 150;
const OBSTACLE_SPACING = 220;

type Obstacle = {
  id: number;
  x: number;
  gapY: number;
  passed?: boolean;
};

function randomGapY() {
  const margin = 120;
  return Math.random() * (GAME_HEIGHT - GAP_HEIGHT - margin * 2) + margin;
}

export function FeatherFlightClient({
  leaderboard,
  gameStarted,
  locked = false,
}: {
  leaderboard: any[];
  gameStarted: boolean;
  locked?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const [birdY, setBirdY] = useState(240);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const velocityRef = useRef(0);
  const birdYRef = useRef(240);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const resetGame = () => {
    if (locked) return;
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    birdYRef.current = GAME_HEIGHT / 2;
    velocityRef.current = 0;
    const initialObstacles: Obstacle[] = [
      { id: 1, x: 260, gapY: randomGapY() },
      { id: 2, x: 260 + OBSTACLE_SPACING, gapY: randomGapY() },
    ];
    obstaclesRef.current = initialObstacles;
    setObstacles(initialObstacles);
    setBirdY(GAME_HEIGHT / 2);
  };

  useEffect(() => {
    if (gameStarted && !locked) {
      resetGame();
      setRunning(true);
      startTimeRef.current = performance.now();
    } else {
      setRunning(false);
    }
  }, [gameStarted, locked]);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();

    const loop = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;

      // Physics
      velocityRef.current += GRAVITY * delta;
      birdYRef.current += velocityRef.current * delta;

      // Move obstacles
      obstaclesRef.current = obstaclesRef.current
        .map((obs) => ({ ...obs, x: obs.x - SCROLL_SPEED * delta }))
        .filter((obs) => obs.x + PIPE_WIDTH > -20);

      // Spawn new obstacle when last one moves enough
      const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
      if (lastObstacle && lastObstacle.x < GAME_WIDTH - OBSTACLE_SPACING) {
        obstaclesRef.current.push({
          id: lastObstacle.id + 1,
          x: GAME_WIDTH + PIPE_WIDTH,
          gapY: randomGapY(),
        });
      }

      // Score when passed
      obstaclesRef.current.forEach((obs) => {
        if (!obs.passed && obs.x + PIPE_WIDTH < 70) {
          obs.passed = true;
          scoreRef.current += 1;
        }
      });

      // Collision
      const birdTop = birdYRef.current;
      const birdBottom = birdTop + 28;
      if (birdTop < 0 || birdBottom > GAME_HEIGHT) {
        endGame();
        return;
      }

      for (const obs of obstaclesRef.current) {
        const inX = 50 + 28 > obs.x && 50 < obs.x + PIPE_WIDTH;
        if (inX) {
          const gapTop = obs.gapY - GAP_HEIGHT / 2;
          const gapBottom = obs.gapY + GAP_HEIGHT / 2;
          if (birdTop < gapTop || birdBottom > gapBottom) {
            endGame();
            return;
          }
        }
      }

      // Render
      setBirdY(birdYRef.current);
      setObstacles([...obstaclesRef.current]);
      setScore(scoreRef.current);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running]);

  const endGame = async () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setRunning(false);
    setGameOver(true);
    setObstacles([...obstaclesRef.current]);
    setBirdY(birdYRef.current);
    const elapsedMs = startTimeRef.current ? performance.now() - startTimeRef.current : 0;
    const finalScore = Math.max(0, Math.round(scoreRef.current * 100 + elapsedMs / 10));
    await submitGameScoreAction(GAME_ID, finalScore, undefined, undefined, {
      obstacles: scoreRef.current,
      elapsedMs: Math.round(elapsedMs),
    });
  };

  const flap = () => {
    if (locked) return;
    if (gameOver) {
      resetGame();
      setRunning(true);
      startTimeRef.current = performance.now();
      return;
    }
    velocityRef.current = FLAP_FORCE;
  };

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          화면을 탭해서 새를 띄우세요. 파이프 사이를 지나며 점수를 쌓아보세요!
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
                  {row.meta?.obstacles ? `${row.meta.obstacles}회 통과` : ''}
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">아직 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="text-center">
        <div className="font-heading text-3xl">{scoreRef.current}</div>
        {gameOver && <div className="text-sm text-destructive font-bold">Game Over</div>}
      </div>

      <div
        className="relative mx-auto border-4 border-black overflow-hidden bg-gradient-to-b from-sky-200 to-blue-400"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={flap}
      >
        {/* Obstacles */}
        {obstacles.map((obs) => (
          <div key={obs.id}>
            <div
              className="absolute bg-green-600 border-2 border-black"
              style={{
                width: PIPE_WIDTH,
                height: obs.gapY - GAP_HEIGHT / 2,
                left: obs.x,
                top: 0,
              }}
            />
            <div
              className="absolute bg-green-600 border-2 border-black"
              style={{
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (obs.gapY + GAP_HEIGHT / 2),
                left: obs.x,
                top: obs.gapY + GAP_HEIGHT / 2,
              }}
            />
          </div>
        ))}

        {/* Bird */}
        <div
          className="absolute w-10 h-7 bg-yellow-300 border-2 border-black rounded-full shadow-[0_4px_0px_rgba(0,0,0,0.4)] transition-transform"
          style={{
            left: 50,
            top: birdY - 14,
            transform: `rotate(${Math.min(30, velocityRef.current / 10)}deg)`,
          }}
        >
          <div className="absolute right-0.5 top-2 w-3 h-3 bg-white border border-black rounded-full"></div>
          <div className="absolute right-3 top-3 w-1.5 h-1.5 bg-black rounded-full"></div>
          <div className="absolute -left-1 top-3 w-4 h-2 bg-orange-400 border-2 border-black rounded-full"></div>
        </div>

        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-orange-200 border-t-4 border-black" />
      </div>

      <button
        onClick={flap}
        className="w-full py-3 border-3 border-black bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
      >
        {gameOver ? '다시 시작' : '탭해서 날기'}
      </button>
    </div>
  );
}
