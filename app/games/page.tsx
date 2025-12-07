import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import Link from "next/link";

const games = [
  {
    id: "one-minute",
    title: "10초 정확히 맞추기",
    description: "큰 버튼 한 번으로 10초에 근접하게 정지",
    href: "/games/one-minute",
    tag: "정밀도",
  },
  {
    id: "reaction",
    title: "반응 속도 테스트",
    description: "신호가 켜지면 즉시 탭 · 반응 ms로 랭킹",
    href: "/games/reaction",
    tag: "반응",
  },
  {
    id: "tetris",
    title: "테트리스 러시",
    description: "클래식 테트리스 · 라인 클리어로 점수 경쟁",
    href: "/games/tetris",
    tag: "스킬",
  },
  {
    id: "color-match",
    title: "컬러 매칭",
    description: "HEX 코드에 맞는 색을 빠르게 선택",
    href: "/games/color-match",
    tag: "퍼즐",
  },
  {
    id: "runner",
    title: "러너 회피",
    description: "점프/이동으로 장애물을 피하며 오래 생존",
    href: "/games/runner",
    tag: "아케이드",
  },
];

export const runtime = "edge";

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">순위 게임</p>
            <h1 className="font-heading text-4xl">오늘의 챌린지</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {games.map((game) => (
            <NeoCard
              key={game.id}
              className="p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold bg-primary px-2 py-1 border-2 border-black">
                  {game.tag}
                </span>
                <Link href={game.href}>
                  <NeoButton size="sm" variant="outline">
                    시작
                  </NeoButton>
                </Link>
              </div>
              <h2 className="font-heading text-2xl mb-2">{game.title}</h2>
              <p className="text-sm text-muted-foreground">{game.description}</p>
            </NeoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
