import { useEffect, useMemo, useState } from "react";
import { submitGameScoreAction } from "../../lib/actions";
import { NeoButton } from "../neo-button";

const GAME_ID = "color-match";

type StageConfig = {
  name: string;
  rounds: number;
  choices: number;
  timeLimitSec: number;
  passScore: number;
  similarity: number;
};

const STAGES: StageConfig[] = [
  { name: "스테이지 1", rounds: 10, choices: 4, timeLimitSec: 9, passScore: 150, similarity: 220 },
  { name: "스테이지 2", rounds: 10, choices: 4, timeLimitSec: 9, passScore: 350, similarity: 200 },
  { name: "스테이지 3", rounds: 10, choices: 4, timeLimitSec: 8, passScore: 550, similarity: 180 },
  { name: "스테이지 4", rounds: 10, choices: 5, timeLimitSec: 8, passScore: 800, similarity: 150 },
  { name: "스테이지 5", rounds: 10, choices: 5, timeLimitSec: 7, passScore: 1100, similarity: 130 },
  { name: "스테이지 6", rounds: 10, choices: 5, timeLimitSec: 7, passScore: 1400, similarity: 110 },
  { name: "스테이지 7", rounds: 10, choices: 6, timeLimitSec: 6, passScore: 1800, similarity: 90 },
  { name: "스테이지 8", rounds: 10, choices: 6, timeLimitSec: 6, passScore: 2200, similarity: 75 },
  { name: "스테이지 9", rounds: 10, choices: 6, timeLimitSec: 5, passScore: 2600, similarity: 60 },
  { name: "스테이지 10", rounds: 10, choices: 6, timeLimitSec: 5, passScore: 3200, similarity: 45 },
];

type RoundResult = {
  hex: string;
  choices: string[];
  correct: string;
  picked?: string;
  elapsedMs?: number;
};

function toRgb(hex: string) {
  const value = parseInt(hex.replace("#", ""), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0") +
    clamp(g).toString(16).padStart(2, "0") +
    clamp(b).toString(16).padStart(2, "0")
  ).toUpperCase();
}

function randomHex() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
}

function generateRound(config: StageConfig): RoundResult {
  const correct = randomHex();
  const base = toRgb(correct);
  const choices: string[] = [correct];

  while (choices.length < config.choices) {
    const jitter = () => (Math.random() - 0.5) * config.similarity;
    const variant = toHex({ r: base.r + jitter(), g: base.g + jitter(), b: base.b + jitter() });
    if (!choices.includes(variant)) {
      choices.push(variant);
    }
  }
  // shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { hex: correct, correct, choices };
}

export function ColorMatchClient({
  leaderboard,
  gameStarted,
  onGameEnd,
}: {
  leaderboard: any[];
  gameStarted: boolean;
  onGameEnd: () => void;
}) {
  const [stageIdx, setStageIdx] = useState(0);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const stage = STAGES[stageIdx];
  const currentRound = rounds[current];

  useEffect(() => {
    // initialize rounds for current stage
    const newRounds = Array.from({ length: stage.rounds }, () => generateRound(stage));
    setRounds(newRounds);
    setCurrent(0);
    setTimeLeft(stage.timeLimitSec * 1000);
  }, [stageIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (finished || failed) return;
    if (!currentRound) return;
    setTimeLeft(stage.timeLimitSec * 1000);
  }, [currentRound, finished, failed, stage.timeLimitSec]);

  useEffect(() => {
    if (finished || failed) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) {
          clearInterval(timer);
          setFailed("시간 초과!");
          onGameEnd();
          return 0;
        }
        return t - 100;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [currentRound, finished, failed, onGameEnd]);

  const pick = async (choice: string) => {
    if (!currentRound || finished || failed) return;
    const elapsed = stage.timeLimitSec * 1000 - timeLeft;
    const isCorrect = choice === currentRound.correct;
    const gained = isCorrect ? 100 : -50;
    const timeBonus = isCorrect ? Math.max(0, Math.round(timeLeft / 100)) : 0; // up to ~80
    const delta = gained + timeBonus;

    const updatedRounds = [...rounds];
    updatedRounds[current] = { ...currentRound, picked: choice, elapsedMs: elapsed };
    setRounds(updatedRounds);
    setScore((s) => s + delta);

    if (current === stage.rounds - 1) {
      if (score + delta < stage.passScore && stageIdx < STAGES.length - 1) {
        setFailed(`스테이지 실패! 통과 점수 ${stage.passScore}점`);
        onGameEnd();
        return;
      }
      if (stageIdx < STAGES.length - 1) {
        setStageIdx((idx) => idx + 1);
        return;
      }
      setFinished(true);
      onGameEnd();
      await submitGameScoreAction(GAME_ID, Math.max(0, score + delta), undefined, undefined, {
        stages: stageIdx + 1,
        rounds: updatedRounds,
      });
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const progress = currentRound ? ((stage.timeLimitSec * 1000 - timeLeft) / (stage.timeLimitSec * 1000)) * 100 : 0;

  if (!gameStarted) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          HEX 코드에 맞는 색을 빠르게 골라보세요!<br/>
          10개의 스테이지를 클리어하며 최고 점수에 도전하세요.
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
                  스테이지 {row.meta?.stages || 1}
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
      {/* Score & Progress */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold">
            {stage.name} · {current + 1}/{stage.rounds}
          </div>
          <div className="font-heading text-xl">점수 {score}</div>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-black/20">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.max(0, 100 - progress)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {(timeLeft / 1000).toFixed(1)}s • 통과점수 {stage.passScore}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {currentRound && (
          <>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-full max-w-[200px] aspect-[2/1] rounded-lg border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                style={{ backgroundColor: currentRound.hex }}
              />
              <div className="font-mono text-lg font-bold">{currentRound.hex}</div>
            </div>

            <div className={`grid gap-2 ${stage.choices <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
              {currentRound.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => pick(choice)}
                  disabled={finished || failed !== null}
                  className="aspect-square rounded-lg border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  style={{ backgroundColor: choice }}
                />
              ))}
            </div>
          </>
        )}

        {(finished || failed) && (
          <div className="text-center p-4 bg-muted border-2 border-black">
            <div className="text-lg font-heading">
              {failed ? failed : `🎉 최종 점수 ${score}점 · 스테이지 ${stageIdx + 1}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
