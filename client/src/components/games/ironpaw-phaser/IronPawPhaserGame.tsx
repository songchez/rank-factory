import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";
import { MainScene } from "./MainScene";
import { LevelUpModal, GameOverModal } from "../ironpaw/modals";
import { submitGameScoreAction } from "../../../lib/actions";
import { GAME_ID } from "../../../constants/games/ironpaw-config";
import { generateWeaponChoices } from "../ironpaw/weapon-system";

interface IronPawPhaserGameProps {
  leaderboard: any[];
  gameStarted?: boolean;
  onGameEnd?: () => void;
  onRestart?: () => void;
  isLoggedIn?: boolean;
  onLoginPrompt?: () => void;
}

export function IronPawPhaserGame({
  leaderboard,
  gameStarted,
  onGameEnd,
  onRestart,
  isLoggedIn = false,
  onLoginPrompt,
}: IronPawPhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<MainScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [weaponChoices, setWeaponChoices] = useState<string[]>([]);
  const [currentWeapons, setCurrentWeapons] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);

  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [killCount, setKillCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!gameStarted || !containerRef.current) return;

    // Prevent multiple game instances
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: "#2a2a2a",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: MainScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Wait for scene to be ready
    game.events.once("ready", () => {
      const scene = game.scene.getScene("MainScene") as MainScene;
      sceneRef.current = scene;

      // Set up callbacks
      scene.onLevelUp = (level: number, weapons: any[]) => {
        setCurrentLevel(level);
        setCurrentWeapons(weapons);
        const choices = generateWeaponChoices(weapons);
        setWeaponChoices(choices);
        setShowLevelUp(true);
      };

      scene.onGameOver = async (won: boolean, score: number, kills: number, elapsed: number) => {
        setVictory(won);
        setFinalScore(score);
        setKillCount(kills);
        setElapsedTime(elapsed);
        setGameOver(true);

        // Submit score if logged in
        if (isLoggedIn) {
          await submitGameScoreAction(GAME_ID, score, undefined, undefined, {
            survived_ms: elapsed,
            kills,
            level: currentLevel,
            won,
          });
        }

        if (onGameEnd) onGameEnd();
      };
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [gameStarted, isLoggedIn, onGameEnd, currentLevel]);

  const handleLevelUpChoice = (choice: string) => {
    if (sceneRef.current) {
      sceneRef.current.addWeapon(choice);
      sceneRef.current.resumeGame();
    }
    setShowLevelUp(false);
  };

  if (!gameStarted) {
    return (
      <>
        <div className="flex items-center gap-4 mb-4">
          <img
            src="/games/ironPaw/profile.png"
            alt="Iron Paw"
            className="w-24 h-24 border-2 border-black object-cover"
          />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              뱀파이어 서바이벌 스타일 액션 게임! 30분간 생존하세요!
              <br />
              WASD 또는 화살표 키로 이동, 무기는 자동 공격!
              <br />
              <span className="text-primary font-bold">⚡ Phaser 3 엔진으로 구동됩니다!</span>
            </p>
            {!isLoggedIn && (
              <div className="text-center text-xs text-amber-600 font-bold mt-2">
                💡 게임은 누구나 즐길 수 있지만, 점수 저장을 위해서는 로그인이 필요합니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 border-2 border-black p-3 max-h-[250px] overflow-y-auto">
          <h3 className="font-heading text-base mb-2">🏆 리더보드</h3>
          <div className="space-y-1.5">
            {leaderboard.slice(0, 8).map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-white border-2 border-black p-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold w-5">{idx + 1}</span>
                  <span className="font-medium">{row.username}</span>
                </div>
                <span className="font-mono font-bold">{row.score?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />

      <LevelUpModal
        show={showLevelUp}
        weaponChoices={weaponChoices}
        weapons={currentWeapons}
        onChooseUpgrade={handleLevelUpChoice}
      />

      <GameOverModal
        show={gameOver}
        victory={victory}
        elapsedTime={elapsedTime}
        killCount={killCount}
        score={finalScore}
        isLoggedIn={isLoggedIn}
        onLoginPrompt={onLoginPrompt}
        onRestart={onRestart}
      />
    </div>
  );
}
