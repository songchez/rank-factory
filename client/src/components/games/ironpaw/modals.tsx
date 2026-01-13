import { Weapon } from "../../../constants/games/ironpaw-config";

interface LevelUpModalProps {
  show: boolean;
  weaponChoices: string[];
  weapons: Weapon[];
  onChooseUpgrade: (choice: string) => void;
}

interface GameOverModalProps {
  show: boolean;
  victory: boolean;
  elapsedTime: number;
  killCount: number;
  score: number;
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
  onRestart?: () => void;
}

const WEAPON_DATA = {
  names: {
    // Projectile weapons
    bone: "본 애로우",
    magic_missile: "매직 미사일",
    fireball: "파이어볼",
    poison_dart: "독 다트",
    dark_bolt: "다크 볼트",

    // Orbital weapons
    orbital_yellow: "황금 오비탈",
    orbital_blue: "얼음 오비탈",
    orbital_red: "화염 오비탈",
    orbital_green: "독 오비탈",
    orbital_purple: "암흑 오비탈",

    // Passive
    "hp-boost": "체력 강화",
    "speed-boost": "이동 속도",
    magnet: "아이템 자석",
  } as Record<string, string>,

  descriptions: {
    // Projectile weapons
    bone: "가장 가까운 적을 향해 뼈다귀 발사",
    magic_missile: "강력한 마법 탄환 (파란색)",
    fireball: "2단 관통하는 화염구 (빨간색)",
    poison_dart: "빠르고 3단 관통 (초록색)",
    dark_bolt: "어둠의 탄환 (보라색)",

    // Orbital weapons
    orbital_yellow: "주변을 도는 황금 구체",
    orbital_blue: "주변을 도는 얼음 구체",
    orbital_red: "주변을 도는 화염 구체",
    orbital_green: "주변을 도는 독 구체",
    orbital_purple: "주변을 도는 암흑 구체",

    // Passive
    "hp-boost": "최대 체력을 10 증가시킵니다",
    "speed-boost": "이동 속도를 15% 증가시킵니다",
    magnet: "아이템 획득 범위를 20% 증가시킵니다",
  } as Record<string, string>,

  icons: {
    // Projectile weapons use effect sprites
    bone: "/games/ironPaw/impact/Yellow Effect Bullet Impact Explosion 32x32.png",
    magic_missile: "/games/ironPaw/impact/Blue Effect Bullet Impact Explosion 32x32.png",
    fireball: "/games/ironPaw/impact/Red Effect Bullet Impact Explosion 32x32.png",
    poison_dart: "/games/ironPaw/impact/Green Effect Bullet Impact Explosion 32x32.png",
    dark_bolt: "/games/ironPaw/impact/Purple Effect Bullet Impact Explosion 32x32.png",

    // Orbital weapons use effect sprites
    orbital_yellow: "/games/ironPaw/impact/Yellow Effect Bullet Impact Explosion 32x32.png",
    orbital_blue: "/games/ironPaw/impact/Blue Effect Bullet Impact Explosion 32x32.png",
    orbital_red: "/games/ironPaw/impact/Red Effect Bullet Impact Explosion 32x32.png",
    orbital_green: "/games/ironPaw/impact/Green Effect Bullet Impact Explosion 32x32.png",
    orbital_purple: "/games/ironPaw/impact/Purple Effect Bullet Impact Explosion 32x32.png",

    // Passive
    "hp-boost": "/games/ironPaw/profile.png",
    "speed-boost": "/games/ironPaw/profile.png",
    magnet: "/games/ironPaw/bluecristal.png",
  } as Record<string, string>,
};

export function LevelUpModal({ show, weaponChoices, weapons, onChooseUpgrade }: LevelUpModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-center mb-4">
          <img
            src="/games/ironPaw/profile.png"
            alt="Level Up"
            className="w-16 h-16 border-2 border-black object-cover"
          />
        </div>
        <h2 className="font-heading text-2xl mb-4 text-center">레벨 업!</h2>
        <p className="text-sm mb-4 text-center">무기를 선택하세요:</p>
        <div className="space-y-3">
          {weaponChoices.map((choice, idx) => {
            const existingWeapon = weapons.find((w) => w.type === choice);
            const isPassive = choice.includes("boost") || choice === "magnet";
            const currentLevel = existingWeapon?.level || 0;
            const maxLevel = isPassive ? 5 : 10;
            const isMaxed = currentLevel >= maxLevel;

            return (
              <button
                key={idx}
                onClick={() => onChooseUpgrade(choice)}
                disabled={isMaxed}
                className={`w-full px-4 py-3 border-2 border-black hover:bg-primary/80 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-3 text-left ${
                  isMaxed
                    ? "opacity-50 cursor-not-allowed bg-muted"
                    : "bg-primary"
                }`}
              >
                <img
                  src={WEAPON_DATA.icons[choice]}
                  alt=""
                  className="w-10 h-10 border border-black object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                      {WEAPON_DATA.names[choice]}
                    </span>
                    <span className="text-xs font-mono">
                      {isMaxed
                        ? "MAX"
                        : currentLevel > 0
                        ? `Lv ${currentLevel} → ${currentLevel + 1}`
                        : "NEW"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {WEAPON_DATA.descriptions[choice]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function GameOverModal({
  show,
  victory,
  elapsedTime,
  killCount,
  score,
  isLoggedIn,
  onLoginPrompt,
  onRestart,
}: GameOverModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center max-w-md">
        <div className="flex justify-center mb-4">
          <img
            src="/games/ironPaw/profile.png"
            alt="Game Over"
            className="w-20 h-20 border-2 border-black object-cover"
          />
        </div>
        <h2 className="font-heading text-4xl mb-4">
          {victory ? "🎉 승리!" : "💀 게임 오버"}
        </h2>
        <p className="text-lg mb-2">
          {victory
            ? "30분을 생존했습니다!"
            : `${Math.floor(elapsedTime / 60000)}분 ${Math.floor(
                (elapsedTime % 60000) / 1000
              )}초 생존`}
        </p>
        <p className="text-base mb-4">
          처치: <span className="font-bold">{killCount}</span> | 최종 점수:{" "}
          <span className="font-bold">{score.toLocaleString()}</span>
        </p>

        {!isLoggedIn && onLoginPrompt && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-500 rounded">
            <p className="text-sm font-bold text-amber-800 mb-2">
              🔒 점수가 저장되지 않았습니다
            </p>
            <p className="text-xs text-amber-700 mb-3">
              로그인하고 랭킹에 도전하세요!
            </p>
            <button
              onClick={onLoginPrompt}
              className="w-full px-4 py-2 bg-amber-500 text-white border-2 border-amber-700 shadow-[2px_2px_0px_0px_rgba(146,64,14,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-bold text-sm"
            >
              로그인하기
            </button>
          </div>
        )}

        {onRestart && (
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-primary border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <span className="text-lg font-bold">다시하기</span>
          </button>
        )}
      </div>
    </div>
  );
}
