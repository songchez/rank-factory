"use client";
export const runtime = "edge";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTopicById,
  getRandomMatchup,
  type RankingItem,
} from "@/lib/mock-data";
import Image from "next/image";
import { NeoButton } from "@/components/neo-button";
import { CommentsDrawer } from "@/components/comments-drawer";
import { MessageCircle, Trophy, SkipForward } from "lucide-react";

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [matchup, setMatchup] = useState<[RankingItem, RankingItem] | null>(
    null
  );
  const [topic, setTopic] = useState(getTopicById(topicId));
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comboCount, setComboCount] = useState(0);

  useEffect(() => {
    if (topic) {
      const newMatchup = getRandomMatchup(topicId);
      setMatchup(newMatchup);
    }
  }, [topicId, topic]);

  const handleVote = (winnerId: string) => {
    setShowConfetti(true);
    setComboCount((prev) => prev + 1);

    setTimeout(() => {
      setShowConfetti(false);
      const newMatchup = getRandomMatchup(topicId);
      setMatchup(newMatchup);
    }, 800);
  };

  const handleSkip = () => {
    setComboCount(0);
    const newMatchup = getRandomMatchup(topicId);
    setMatchup(newMatchup);
  };

  const handleViewResults = () => {
    router.push(`/ranking/${topicId}`);
  };

  if (!topic || !matchup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-heading text-2xl">로딩중...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ["#FFDE59", "#FF5757", "#8C52FF"][
                    Math.floor(Math.random() * 3)
                  ],
                  animationDelay: `${Math.random() * 0.3}s`,
                  animationDuration: `${0.6 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
          {comboCount > 2 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-accent text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-8 py-4 animate-pulse">
                <p className="font-heading text-4xl">COMBO x{comboCount}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Split View */}
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left Candidate */}
        <button
          onClick={() => handleVote(matchup[0].id)}
          className="relative group overflow-hidden border-r-3 border-black hover:scale-105 transition-transform duration-300 active:scale-100"
          style={{ minHeight: "44px" }}
        >
          <Image
            src={matchup[0].imageUrl || "/placeholder.svg"}
            alt={matchup[0].name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="font-heading text-4xl md:text-6xl text-white mb-2 text-balance">
              {matchup[0].name}
            </h2>
            <p className="text-white/80 text-lg">
              ELO {matchup[0].eloScore} • {matchup[0].winCount}승{" "}
              {matchup[0].lossCount}패
            </p>
          </div>
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
        </button>

        {/* Right Candidate */}
        <button
          onClick={() => handleVote(matchup[1].id)}
          className="relative group overflow-hidden hover:scale-105 transition-transform duration-300 active:scale-100"
          style={{ minHeight: "44px" }}
        >
          <Image
            src={matchup[1].imageUrl || "/placeholder.svg"}
            alt={matchup[1].name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="font-heading text-4xl md:text-6xl text-white mb-2 text-balance">
              {matchup[1].name}
            </h2>
            <p className="text-white/80 text-lg">
              ELO {matchup[1].eloScore} • {matchup[1].winCount}승{" "}
              {matchup[1].lossCount}패
            </p>
          </div>
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/20 transition-colors duration-300" />
        </button>
      </div>

      {/* VS Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="bg-accent text-accent-foreground border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-12 py-6 rotate-6 animate-pulse">
          <p className="font-heading text-6xl">VS</p>
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-background/95 border-b-3 border-black p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl">{topic.title}</h1>
            <p className="text-sm text-muted-foreground">{topic.category}</p>
          </div>
          <NeoButton
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
          >
            나가기
          </NeoButton>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-background border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-6 py-4 flex items-center gap-4">
          <NeoButton
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="flex items-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            건너뛰기
          </NeoButton>
          <NeoButton
            variant="primary"
            size="sm"
            onClick={handleViewResults}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            결과보기
          </NeoButton>
          <NeoButton
            variant="accent"
            size="sm"
            onClick={() => setIsCommentsOpen(true)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            댓글
          </NeoButton>
        </div>
      </div>

      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        topicTitle={topic.title}
        items={topic.items.map((item) => ({ id: item.id, name: item.name }))}
      />
    </div>
  );
}
