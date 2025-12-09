import { Link } from 'react-router-dom';
import { Header } from '../../components/header';
import { NeoCard } from '../../components/neo-card';
import { NeoButton } from '../../components/neo-button';

const games = [
  {
    id: "color-match",
    title: "알록달록 컬러픽",
    subtitle: "Colorful Color Pick",
    description: "무지개빛 색깔의 향연! HEX 코드에 맞는 색을 빠르게 골라보세요",
    image: "/games/Colorful Color Pick.png",
    href: "/games/color-match",
    tag: "🎨 퍼즐",
    gradient: "from-pink-400 via-purple-400 to-blue-400",
  },
  {
    id: "runner",
    title: "달려라 픽셀냥",
    subtitle: "Run, Pixel Cat",
    description: "귀여운 픽셀 고양이와 함께! 장애물을 피하며 끝없이 달려보세요",
    image: "/games/Run, Pixel Cat.png",
    href: "/games/runner",
    tag: "🐱 아케이드",
    gradient: "from-orange-400 to-pink-500",
  },
  {
    id: "reaction",
    title: "뿅뿅 풍선터뜨리기",
    subtitle: "Pyong Pyong Ball Touch",
    description: "풍선이 나타나면 빠르게 터뜨려요! 당신의 반응속도는 몇 ms?",
    image: "/games/Pyong Pyong Ball Touch.png",
    href: "/games/reaction",
    tag: "🎈 반응",
    gradient: "from-red-400 to-yellow-400",
  },
  {
    id: "ten-seconds",
    title: "칼각 10초",
    subtitle: "Perfect Angle 10 Sec",
    description: "정확히 10.00초를 맞춰보세요! 칼각의 정밀도가 필요합니다",
    image: "/games/Perfect Angle 10 Sec.png",
    href: "/games/ten-seconds",
    tag: "⏱️ 정밀도",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    id: "tetris",
    title: "블록냥이 탑쌓기",
    subtitle: "Block Cat's Tower Stack",
    description: "냥이와 함께하는 블록 쌓기! 라인을 완성하며 최고 점수에 도전하세요",
    image: "/games/Block Cat's Tower Stack.png",
    href: "/games/tetris",
    tag: "🧱 스킬",
    gradient: "from-purple-400 to-indigo-500",
  },
];

export default function GamesList() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="hidden md:block">
        <Header />
      </div>
      <main className="px-3 py-3 md:py-8 space-y-4">
        <div className="px-1">
          <p className="text-xs text-muted-foreground">순위 게임</p>
          <h1 className="font-heading text-2xl">오늘의 챌린지</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {games.map((game) => (
            <Link key={game.id} to={game.href}>
              <NeoCard className="aspect-square overflow-hidden active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer p-0 relative group">
                {/* Game Image - Full Cover */}
                <img
                  src={game.image}
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay Gradient on Touch */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-active:opacity-30 transition-opacity duration-300`}></div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-3 border-black p-2">
                  <h2 className="font-heading text-sm text-center leading-tight">
                    {game.title}
                  </h2>
                </div>
              </NeoCard>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
