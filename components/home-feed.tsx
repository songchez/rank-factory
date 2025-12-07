"use client";

import { useMemo, useState } from "react";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { getModePlayPath } from "@/lib/topics";
import Image from "next/image";
import Link from "next/link";
import type { RankingTopic } from "@/lib/types";

type TabKey = "ALL" | "A" | "B" | "C" | "D";

function scoreTopic(topic: RankingTopic) {
  const topElo = topic.items.reduce((max: number, item) => Math.max(max, item.eloScore || 0), 0);
  const matchSum = topic.items.reduce((sum: number, item) => sum + (item.matchCount || 0), 0);
  const ageHours = Math.max(0, (Date.now() - new Date(topic.createdAt).getTime()) / (1000 * 60 * 60));
  const recencyBoost = Math.max(0, 72 - ageHours) * 4;
  return topElo + matchSum * 0.2 + recencyBoost;
}

interface HomeFeedProps {
  topics: RankingTopic[];
}

export default function HomeFeed({ topics }: HomeFeedProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  const { curated, fresh, heroTopic, filteredTopics, heroTopItems } = useMemo(() => {
    const curatedList = [...topics]
      .map((topic) => ({ topic, score: scoreTopic(topic) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.topic);

    const freshList = [...topics]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    const hero = curatedList[0] || topics[0];
    const heroItems = hero.items.slice().sort((a, b) => b.eloScore - a.eloScore).slice(0, 2);

    const filtered = activeTab === "ALL" ? topics : topics.filter((topic) => topic.mode === activeTab);

    return {
      curated: curatedList,
      fresh: freshList,
      heroTopic: hero,
      filteredTopics: filtered,
      heroTopItems: heroItems,
    };
  }, [topics, activeTab]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "전체" },
    { key: "A", label: "배틀형" },
    { key: "B", label: "진단형" },
    { key: "C", label: "티어형" },
    { key: "D", label: "팩트형" },
  ];

  return (
    <div className="space-y-10">
      {/* Hero + curated */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <Link href={getModePlayPath(heroTopic)} className="md:col-span-2 md:row-span-2">
          <NeoCard className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer overflow-hidden p-0">
            <div className="relative h-full min-h-[400px]">
              <div className="absolute inset-0 grid grid-cols-2">
                {heroTopItems.map((item, idx) => (
                  <div key={item.id} className="relative">
                    <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    <div
                      className={`absolute bottom-0 left-0 right-0 ${
                        idx === 0 ? "bg-primary border-r-3" : "bg-secondary text-white border-l-3"
                      } p-4 border-t-3 border-black`}
                    >
                      <p className="font-heading text-xl text-center">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-accent text-accent-foreground border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 py-4 rotate-3">
                  <p className="font-heading text-4xl">오늘의 추천</p>
                </div>
              </div>

              <div className="absolute top-0 left-0 right-0 bg-background/95 border-b-3 border-black p-4">
                <p className="font-heading text-2xl text-center">{heroTopic.title}</p>
                <p className="text-center text-sm mt-1">{heroTopic.category}</p>
              </div>
            </div>
          </NeoCard>
        </Link>

        <NeoCard variant="primary" className="md:row-span-2">
          <h2 className="font-heading text-2xl mb-4">추천 피드</h2>
          <div className="space-y-3">
            {curated.map((topic) => (
              <Link key={topic.id} href={getModePlayPath(topic)}>
                <div className="flex items-center gap-3 bg-background border-2 border-black p-3 hover:bg-gray-50 transition-colors">
                  <div className="relative w-12 h-12 border-2 border-black flex-shrink-0">
                    <Image
                      src={topic.items[0]?.imageUrl || "/placeholder.svg"}
                      alt={topic.items[0]?.name || topic.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">{topic.category}</p>
                  </div>
                  <NeoButton size="sm" variant="outline">
                    플레이
                  </NeoButton>
                </div>
              </Link>
            ))}
          </div>
        </NeoCard>

        <NeoCard variant="accent" className="md:col-span-2">
          <h2 className="font-heading text-2xl mb-4 flex items-center justify-between">
            새로 올라온 것
            <span className="text-xs text-muted-foreground">최근 4개</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fresh.map((topic) => (
              <Link key={topic.id} href={getModePlayPath(topic)}>
                <div className="flex items-center gap-3 bg-white border-2 border-black p-3 hover:bg-gray-50 transition-colors text-foreground">
                  <div className="relative w-16 h-16 border-2 border-black flex-shrink-0 bg-white">
                    <Image
                      src={topic.items[0]?.imageUrl || "/placeholder.svg"}
                      alt={topic.items[0]?.name || topic.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-lg leading-tight text-foreground">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(topic.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </NeoCard>
      </div>

      {/* Tabs + grid */}
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <NeoButton
                key={tab.key}
                variant={isActive ? "primary" : "outline"}
                size="sm"
                className="min-w-[90px]"
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </NeoButton>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Link key={topic.id} href={getModePlayPath(topic)}>
              <NeoCard className="hover:translate-x-1 hover:translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="flex gap-2 mb-4">
                  <div className="relative w-20 h-20 border-2 border-black">
                    <Image
                      src={topic.items[0]?.imageUrl || "/placeholder.svg"}
                      alt={topic.items[0]?.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative w-20 h-20 border-2 border-black">
                    <Image
                      src={topic.items[1]?.imageUrl || "/placeholder.svg"}
                      alt={topic.items[1]?.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-heading text-xl mb-2">{topic.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-primary px-2 py-1 border-2 border-black">{topic.category}</span>
                  <span>{topic.items.length}개 항목</span>
                </div>
              </NeoCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
