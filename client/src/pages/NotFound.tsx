import { useNavigate } from "react-router-dom";
import { NeoButton } from "../components/neo-button";
import { useState, useEffect } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const [glitchActive, setGlitchActive] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<
    Array<{ id: number; x: number; emoji: string }>
  >([]);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Floating emoji animation on click
  const handleClick = (e: React.MouseEvent) => {
    const emojis = ["😵", "🤔", "😅", "🎮", "🏆", "⚡"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newEmoji = {
      id: Date.now(),
      x: e.clientX,
      emoji: randomEmoji,
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((em) => em.id !== newEmoji.id));
    }, 1000);
  };

  const recommendedPages = [
    { path: "/games", label: "🎮 게임하기", color: "bg-primary" },
    { path: "/?mode=A", label: "⚔️ 배틀", color: "bg-secondary" },
    { path: "/?mode=B", label: "📝 테스트", color: "bg-accent" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      onClick={handleClick}
    >
      {/* Floating emojis */}
      {floatingEmojis.map((item) => (
        <div
          key={item.id}
          className="fixed text-4xl pointer-events-none animate-float-up"
          style={{
            left: `${item.x}px`,
            top: "50%",
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Pixelated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 11px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 11px
            )`,
          }}
        />
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* Sad robot image */}
        <div className="flex justify-center mb-4">
          <img
            src="/404-robot.png"
            alt="Sad robot"
            className="w-32 h-32 md:w-48 md:h-48 pixelated select-none"
            style={{
              imageRendering: "pixelated",
              filter: glitchActive ? "hue-rotate(180deg)" : "none",
              transition: "filter 0.2s",
            }}
          />
        </div>

        {/* 404 Text with glitch effect */}
        <div className="relative">
          <h1
            className={`font-logo text-[60px] md:text-[120px] font-bold leading-none select-none transition-all ${
              glitchActive ? "animate-glitch" : ""
            }`}
            style={{
              textShadow: glitchActive
                ? "4px 4px 0 #ff5757, -4px -4px 0 #8c52ff"
                : "6px 6px 0 #000",
            }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-2 select-none">
          <p className="font-fixel text-2xl md:text-3xl font-bold">
            페이지를 찾을 수 없습니다
          </p>
          <p className="font-fixel text-lg text-muted-foreground">
            클릭해서 이모지를 날려보세요! 😄
          </p>
        </div>

        {/* Home button */}
        <div className="pt-4">
          <NeoButton
            size="lg"
            onClick={() => navigate("/")}
            className="font-fixel text-lg px-8"
          >
            🏠 홈으로 돌아가기
          </NeoButton>
        </div>

        {/* Recommended pages */}
        <div className="pt-8 space-y-4">
          <p className="font-fixel text-sm text-muted-foreground select-none">
            또는 여기를 둘러보세요:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {recommendedPages.map((page) => (
              <button
                key={page.path}
                onClick={() => navigate(page.path)}
                className={`font-fixel ${page.color} text-foreground px-4 py-2 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] select-none`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, 3px);
          }
          40% {
            transform: translate(3px, -3px);
          }
          60% {
            transform: translate(-3px, -3px);
          }
          80% {
            transform: translate(3px, 3px);
          }
        }

        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }

        .animate-glitch {
          animation: glitch 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
