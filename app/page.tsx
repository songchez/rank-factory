import { Header } from "@/components/header";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { mockTopics } from "@/lib/mock-data";
import Link from "next/link";
import Image from "next/image";
export const runtime = "edge";

export default function HomePage() {
  const featuredTopic = mockTopics[0];
  const topItems = featuredTopic.items.slice(0, 5);
  const newTopic = mockTopics[mockTopics.length - 1];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-6xl mb-4 text-center">
            세상 모든 것에 서열을
          </h1>
          <p className="text-center text-lg md:text-xl mb-2">
            반박 시 니 말이 틀림
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Hero Card - Featured Battle */}
          <Link
            href={`/battle/${featuredTopic.id}`}
            className="md:col-span-2 md:row-span-2"
          >
            <NeoCard className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer overflow-hidden p-0">
              <div className="relative h-full min-h-[400px]">
                <div className="absolute inset-0 grid grid-cols-2">
                  <div className="relative">
                    <Image
                      src={
                        featuredTopic.items[0].imageUrl || "/placeholder.svg"
                      }
                      alt={featuredTopic.items[0].name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-primary p-4 border-t-3 border-r-3 border-black">
                      <p className="font-heading text-xl text-center">
                        {featuredTopic.items[0].name}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <Image
                      src={
                        featuredTopic.items[1].imageUrl || "/placeholder.svg"
                      }
                      alt={featuredTopic.items[1].name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-secondary p-4 border-t-3 border-l-3 border-black">
                      <p className="font-heading text-xl text-center text-white">
                        {featuredTopic.items[1].name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-accent text-accent-foreground border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 py-4 rotate-3">
                    <p className="font-heading text-4xl">VS</p>
                  </div>
                </div>

                {/* Title Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-background/95 border-b-3 border-black p-4">
                  <p className="font-heading text-2xl text-center">
                    오늘의 빅매치
                  </p>
                  <p className="text-center text-sm mt-1">
                    {featuredTopic.title}
                  </p>
                </div>
              </div>
            </NeoCard>
          </Link>

          {/* Rank List */}
          <NeoCard variant="primary" className="md:row-span-2">
            <h2 className="font-heading text-2xl mb-4">실시간 급상승</h2>
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-background border-2 border-black p-3"
                >
                  <span className="font-heading text-2xl w-8">{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ELO {item.eloScore}
                    </p>
                  </div>
                  {item.change && item.change > 0 && (
                    <span className="text-secondary font-bold">
                      ▲{item.change}
                    </span>
                  )}
                  {item.change && item.change < 0 && (
                    <span className="text-accent font-bold">
                      ▼{Math.abs(item.change)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Link href={`/ranking/${featuredTopic.id}`}>
              <NeoButton variant="outline" className="w-full mt-4">
                전체 순위 보기
              </NeoButton>
            </Link>
          </NeoCard>

          {/* New Arrivals */}
          <Link href={`/battle/${newTopic.id}`} className="md:col-span-2">
            <NeoCard
              variant="accent"
              className="hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 border-3 border-black">
                  <Image
                    src={newTopic.items[0].imageUrl || "/placeholder.svg"}
                    alt={newTopic.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute -top-2 -right-2 bg-secondary text-white border-2 border-black px-2 py-1 text-xs font-bold rotate-12">
                    NEW
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-1">AI 신규 생성</p>
                  <h3 className="font-heading text-xl mb-2">
                    {newTopic.title}
                  </h3>
                  <p className="text-sm">방금 생성됨 • {newTopic.category}</p>
                </div>
              </div>
            </NeoCard>
          </Link>
        </div>

        {/* All Topics Grid */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl mb-6">모든 배틀</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTopics.map((topic) => (
              <Link key={topic.id} href={`/battle/${topic.id}`}>
                <NeoCard className="hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                  <div className="flex gap-2 mb-4">
                    <div className="relative w-20 h-20 border-2 border-black">
                      <Image
                        src={topic.items[0].imageUrl || "/placeholder.svg"}
                        alt={topic.items[0].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative w-20 h-20 border-2 border-black">
                      <Image
                        src={topic.items[1].imageUrl || "/placeholder.svg"}
                        alt={topic.items[1].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="font-heading text-xl mb-2">{topic.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-primary px-2 py-1 border-2 border-black">
                      {topic.category}
                    </span>
                    <span>{topic.items.length}개 항목</span>
                  </div>
                </NeoCard>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
