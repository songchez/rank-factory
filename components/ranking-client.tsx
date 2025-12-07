"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { CommentsDrawer } from "@/components/comments-drawer";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Share2 } from "lucide-react";
import { RankingTopic, Comment } from "@/lib/types";
import { getModePlayPath } from "@/lib/topics";

interface RankingClientProps {
  topic: RankingTopic;
  initialComments: Comment[];
}

export default function RankingClient({ topic, initialComments }: RankingClientProps) {
  const router = useRouter();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const sortedItems = [...topic.items].sort((a, b) => b.eloScore - a.eloScore);
  const [first, second, third, ...rest] = sortedItems;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${topic.title} 랭킹 결과`,
        text: `1위는 ${first.name}입니다!`,
        url: window.location.href,
      });
    } else {
      alert("공유 기능이 지원되지 않는 브라우저입니다");
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl md:text-6xl mb-4">
            {topic.title}
          </h1>
          <p className="text-lg">최종 랭킹 결과</p>
        <div className="mt-4 flex items-center justify-center gap-4">
            <Link href={getModePlayPath(topic)}>
              <NeoButton variant="primary">다시 투표하기</NeoButton>
            </Link>
            <NeoButton
              variant="secondary"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </NeoButton>
            <NeoButton
              variant="accent"
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              댓글
            </NeoButton>
          </div>
        </div>

        {/* Podium */}
        <div className="mb-12">
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto items-end">
            {/* 2nd Place */}
            {second && (
              <div className="flex flex-col items-center">
                <NeoCard variant="default" className="w-full mb-4 bg-gray-300">
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={second.imageUrl || "/placeholder.svg"}
                      alt={second.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-heading text-4xl mb-2">2</div>
                    <h3 className="font-heading text-xl mb-2">{second.name}</h3>
                    <p className="text-sm">ELO {second.eloScore}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {second.winCount}승 {second.lossCount}패
                    </p>
                  </div>
                </NeoCard>
                <div className="w-full h-32 bg-gray-300 border-3 border-black" />
              </div>
            )}

            {/* 1st Place */}
            {first && (
              <div className="flex flex-col items-center">
                <NeoCard variant="primary" className="w-full mb-4">
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={first.imageUrl || "/placeholder.svg"}
                      alt={first.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute -top-4 -right-4 bg-secondary text-white border-3 border-black px-3 py-2 font-heading text-2xl rotate-12">
                      👑
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-heading text-5xl mb-2">1</div>
                    <h3 className="font-heading text-2xl mb-2">{first.name}</h3>
                    <p className="text-sm">ELO {first.eloScore}</p>
                    <p className="text-xs mt-1">
                      {first.winCount}승 {first.lossCount}패
                    </p>
                  </div>
                </NeoCard>
                <div className="w-full h-48 bg-primary border-3 border-black" />
              </div>
            )}

            {/* 3rd Place */}
            {third && (
              <div className="flex flex-col items-center">
                <NeoCard variant="default" className="w-full mb-4 bg-orange-300">
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={third.imageUrl || "/placeholder.svg"}
                      alt={third.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-heading text-4xl mb-2">3</div>
                    <h3 className="font-heading text-xl mb-2">{third.name}</h3>
                    <p className="text-sm">ELO {third.eloScore}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {third.winCount}승 {third.lossCount}패
                    </p>
                  </div>
                </NeoCard>
                <div className="w-full h-20 bg-orange-300 border-3 border-black" />
              </div>
            )}
          </div>
        </div>

        {/* Rest of Rankings */}
        {rest.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl mb-6">전체 순위</h2>
            <div className="space-y-4">
              {rest.map((item, index) => (
                <NeoCard key={item.id} className="flex items-center gap-4">
                  <div className="font-heading text-3xl w-12 text-center">
                    {index + 4}
                  </div>
                  <div className="relative w-20 h-20 border-2 border-black flex-shrink-0">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ELO {item.eloScore} • {item.winCount}승 {item.lossCount}패
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      승률 {item.matchCount > 0 ? Math.round((item.winCount / item.matchCount) * 100) : 0}
                      %
                    </div>
                    <div className="w-32 h-2 bg-muted border border-black mt-2">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${item.matchCount > 0 ? (item.winCount / item.matchCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </NeoCard>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CommentsDrawer */}
      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        topicId={topic.id}
        topicTitle={topic.title}
        items={topic.items.map((item) => ({ id: item.id, name: item.name }))}
        initialComments={initialComments}
      />
    </div>
  );
}
