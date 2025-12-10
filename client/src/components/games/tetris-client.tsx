import { useEffect, useMemo, useState } from "react";
import { NeoButton } from "../neo-button";
import { submitGameScoreAction } from "../../lib/actions";
import { NeoCard } from "../neo-card";

const COLS = 10;
const ROWS = 20;
const PIECES = [
  {
    shape: [
      [[1, 1], [1, 1]],
    ],
    color: "#f59e0b", // O
  },
  {
    shape: [
      [[0, 2, 0], [2, 2, 2], [0, 0, 0]],
      [[0, 2, 0], [0, 2, 2], [0, 2, 0]],
      [[0, 0, 0], [2, 2, 2], [0, 2, 0]],
      [[0, 2, 0], [2, 2, 0], [0, 2, 0]],
    ],
    color: "#22d3ee", // T
  },
  {
    shape: [
      [[3, 3, 3], [0, 0, 3], [0, 0, 0]],
      [[0, 3, 0], [0, 3, 0], [3, 3, 0]],
      [[3, 0, 0], [3, 3, 3], [0, 0, 0]],
      [[0, 3, 3], [0, 3, 0], [0, 3, 0]],
    ],
    color: "#6366f1", // L
  },
  {
    shape: [
      [[4, 4, 4], [4, 0, 0], [0, 0, 0]],
      [[4, 4, 0], [0, 4, 0], [0, 4, 0]],
      [[0, 0, 4], [4, 4, 4], [0, 0, 0]],
      [[0, 4, 0], [0, 4, 0], [0, 4, 4]],
    ],
    color: "#10b981", // J (greenish)
  },
  {
    shape: [
      [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
      [[5, 0, 0], [5, 5, 0], [0, 5, 0]],
    ],
    color: "#ec4899", // S
  },
  {
    shape: [
      [[6, 6, 0], [0, 6, 6], [0, 0, 0]],
      [[0, 6, 0], [6, 6, 0], [6, 0, 0]],
    ],
    color: "#f97316", // Z
  },
  {
    shape: [
      [[0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0]],
      [[0, 0, 0, 0], [7, 7, 7, 7], [0, 0, 0, 0], [0, 0, 0, 0]],
    ],
    color: "#3b82f6", // I
  },
];

type Cell = { value: number; color?: string };

interface Piece {
  shape: number[][][];
  rotation: number;
  x: number;
  y: number;
  color: string;
}

interface TetrisClientProps {
  leaderboard: any[];
  gameStarted?: boolean;
  onGameEnd?: () => void;
  locked?: boolean;
}

const GAME_ID = "tetris";

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ value: 0 }))
  );
}

function randomPiece(): Piece {
  const pick = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    shape: pick.shape,
    rotation: 0,
    x: 3,
    y: 0,
    color: pick.color,
  };
}

function canMove(board: Cell[][], piece: Piece, offsetX: number, offsetY: number, nextRot?: number) {
  const rotation = nextRot ?? piece.rotation;
  const matrix = piece.shape[rotation % piece.shape.length];

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === 0) continue;
      const newX = piece.x + x + offsetX;
      const newY = piece.y + y + offsetY;

      if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
      if (newY >= 0 && board[newY][newX].value !== 0) return false;
    }
  }
  return true;
}

function mergeBoard(board: Cell[][], piece: Piece) {
  const matrix = piece.shape[piece.rotation % piece.shape.length];
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          newBoard[boardY][boardX] = { value: matrix[y][x], color: piece.color };
        }
      }
    }
  }
  return newBoard;
}

function clearLines(board: Cell[][]) {
  const newBoard: Cell[][] = [];
  let cleared = 0;
  for (let y = 0; y < ROWS; y++) {
    if (board[y].every((cell) => cell.value !== 0)) {
      cleared += 1;
    } else {
      newBoard.push(board[y]);
    }
  }
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array.from({ length: COLS }, () => ({ value: 0 })));
  }
  return { board: newBoard, cleared };
}

export function TetrisClient({ leaderboard, gameStarted, onGameEnd, locked = false }: TetrisClientProps) {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece());
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  const tickMs = useMemo(() => Math.max(150, 1000 - (level - 1) * 75), [level]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setDurationMs(startAt ? performance.now() - startAt : 0);
      drop();
    }, tickMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, tickMs, piece, startAt]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (locked || !isRunning || !piece) return;
      if (e.key === "ArrowLeft") {
        move(-1);
      } else if (e.key === "ArrowRight") {
        move(1);
      } else if (e.key === "ArrowDown") {
        drop();
      } else if (e.key === "ArrowUp" || e.key === "w") {
        rotate();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleHardDrop();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, piece, locked]);

  const startGame = () => {
    if (locked) return;
    setBoard(createEmptyBoard());
    const first = nextPiece || randomPiece();
    setPiece(first);
    setNextPiece(randomPiece());
    setIsRunning(true);
    setGameOver(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    setDurationMs(0);
    setStartAt(performance.now());
  };

  const stopGame = () => {
    setIsRunning(false);
    setGameOver(true);
  };

  const drop = () => {
    if (!piece) return;
    if (canMove(board, piece, 0, 1)) {
      setPiece({ ...piece, y: piece.y + 1 });
    } else {
      const merged = mergeBoard(board, piece);
      const { board: clearedBoard, cleared } = clearLines(merged);
      setBoard(clearedBoard);
      if (cleared > 0) {
        const newLines = lines + cleared;
        setLines(newLines);
        const linePoints = [0, 100, 300, 500, 800];
        const gained = (linePoints[cleared] || 0) * level;
        setScore((s) => s + gained);
        setLevel(1 + Math.floor(newLines / 10));
      }
      // spawn next
      const incoming = nextPiece || randomPiece();
      const spawnPiece = { ...incoming, x: 3, y: 0 };
      if (!canMove(clearedBoard, spawnPiece, 0, 0)) {
        endGame(clearedBoard);
      } else {
        setPiece(spawnPiece);
        setNextPiece(randomPiece());
      }
    }
  };

  const move = (dir: number) => {
    if (!piece) return;
    if (canMove(board, piece, dir, 0)) {
      setPiece({ ...piece, x: piece.x + dir });
    }
  };

  const rotate = () => {
    if (!piece) return;
    const nextRot = (piece.rotation + 1) % piece.shape.length;
    if (canMove(board, piece, 0, 0, nextRot)) {
      setPiece({ ...piece, rotation: nextRot });
    }
  };

  const endGame = async (finalBoard: Cell[][]) => {
    setBoard(finalBoard);
    setIsRunning(false);
    setGameOver(true);
    const duration = startAt ? performance.now() - startAt : 0;
    setDurationMs(duration);
    const finalScore = score;
    await submitGameScoreAction(GAME_ID, finalScore, undefined, undefined, {
      lines,
      level,
      duration_ms: Math.round(duration),
    });
  };

  const handleHardDrop = () => {
    if (locked || !isRunning || !piece) return;
    let newY = piece.y;
    while (canMove(board, piece, 0, newY - piece.y + 1)) {
      newY += 1;
    }
    if (newY !== piece.y) {
      setPiece({ ...piece, y: newY });
      // After moving piece to bottom, merge immediately
      const merged = mergeBoard(board, { ...piece, y: newY });
      const { board: clearedBoard, cleared } = clearLines(merged);
      setBoard(clearedBoard);
      if (cleared > 0) {
        const newLines = lines + cleared;
        setLines(newLines);
        const linePoints = [0, 100, 300, 500, 800];
        const gained = (linePoints[cleared] || 0) * level;
        setScore((s) => s + gained);
        setLevel(1 + Math.floor(newLines / 10));
      }
      const incoming = nextPiece || randomPiece();
      const spawnPiece = { ...incoming, x: 3, y: 0 };
      if (!canMove(clearedBoard, spawnPiece, 0, 0)) {
        endGame(clearedBoard);
      } else {
        setPiece(spawnPiece);
        setNextPiece(randomPiece());
      }
    }
  };

  const renderBoard = () => {
    const display = board.map((row) => row.map((cell) => ({ ...cell })));
    if (piece) {
      const matrix = piece.shape[piece.rotation % piece.shape.length];
      for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
          if (matrix[y][x] !== 0) {
            const boardY = piece.y + y;
            const boardX = piece.x + x;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              display[boardY][boardX] = { value: matrix[y][x], color: piece.color };
            }
          }
        }
      }
    }
    return display;
  };

  const boardToRender = renderBoard();

  useEffect(() => {
    if (gameStarted && !locked) {
      startGame();
    } else {
      setIsRunning(false);
    }
  }, [gameStarted, locked]);

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          기본 조작: ← → 이동, ↑ 회전, ↓ 소프트드롭, 스페이스 하드드롭
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
                  {row.meta?.lines ? `${row.meta.lines}줄` : ""}
                  {row.meta?.level ? ` • 레벨 ${row.meta.level}` : ""}
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <NeoButton onClick={startGame} disabled={isRunning || locked} size="sm">
          시작
        </NeoButton>
        <NeoButton variant="accent" onClick={stopGame} disabled={!isRunning || locked} size="sm">
          중단
        </NeoButton>
        <div className="text-sm text-muted-foreground">
          점수 {score} • 라인 {lines} • 레벨 {level} • 시간 {(durationMs / 1000).toFixed(1)}s
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[auto_auto] gap-4">
        <div className="flex flex-col gap-3">
          <NeoCard className="p-3 bg-muted border-2 border-black md:hidden">
            <p className="text-xs font-bold">다음 블록</p>
            <div className="grid grid-cols-4 gap-[1px] mt-2 justify-start" style={{ gridTemplateColumns: "repeat(4, 20px)" }}>
              {Array.from({ length: 16 }).map((_, idx) => {
                const row = Math.floor(idx / 4);
                const col = idx % 4;
                const matrix = nextPiece.shape[0];
                const val =
                  row < matrix.length && col < matrix[row].length
                    ? matrix[row][col]
                    : 0;
                return (
                  <div
                    key={idx}
                    className="w-[20px] h-[20px] border border-black/10"
                    style={{ backgroundColor: val ? nextPiece.color : "white" }}
                  />
                );
              })}
            </div>
          </NeoCard>

          <div className="bg-muted border-2 border-black p-2 overflow-hidden">
            <div
              className="grid gap-[1px] justify-center"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 20px)`,
              }}
            >
              {boardToRender.flatMap((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="w-[20px] h-[20px] border border-black/10"
                    style={{ backgroundColor: cell.color || "white" }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-3">
          <NeoCard className="p-3 bg-muted border-2 border-black">
            <p className="text-sm font-bold">다음 블록</p>
            <div className="grid grid-cols-4 gap-[1px] mt-2" style={{ gridTemplateColumns: "repeat(4, 20px)" }}>
              {Array.from({ length: 16 }).map((_, idx) => {
                const row = Math.floor(idx / 4);
                const col = idx % 4;
                const matrix = nextPiece.shape[0];
                const val =
                  row < matrix.length && col < matrix[row].length
                    ? matrix[row][col]
                    : 0;
                return (
                  <div
                    key={idx}
                    className="w-[20px] h-[20px] border border-black/10"
                    style={{ backgroundColor: val ? nextPiece.color : "white" }}
                  />
                );
              })}
            </div>
          </NeoCard>
          {gameOver && <p className="text-sm text-red-600 font-bold">게임 오버! 시작을 눌러 다시 플레이하세요.</p>}
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
                  {row.meta?.lines ? `${row.meta.lines}줄` : ""}
                  {row.meta?.level ? ` • 레벨 ${row.meta.level}` : ""}
                  {row.meta?.duration_ms ? ` • ${Math.round(row.meta.duration_ms / 1000)}초` : ""}
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
