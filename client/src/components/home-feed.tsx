import { useMemo, useState, useRef, useEffect } from "react";
import { NeoCard } from "./neo-card";
import { getModePlayPath, getModeLabel } from "../lib/topics";
import { Link, useNavigate } from "react-router-dom";
import type { RankingTopic } from "../lib/types";
import { LikeButton } from "./like-button";
import { ShareButton } from "./share-button";

function scoreTopic(topic: RankingTopic) {
  const createdAt = topic.createdAt ? new Date(topic.createdAt) : new Date();
  const topElo = topic.items.reduce(
    (max: number, item) => Math.max(max, item.eloScore || 0),
    0
  );
  const matchSum = topic.items.reduce(
    (sum: number, item) => sum + (item.matchCount || 0),
    0
  );
  const ageHours = Math.max(
    0,
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  );
  const recencyBoost = Math.max(0, 72 - ageHours) * 4;
  return topElo + matchSum * 0.2 + recencyBoost;
}

// Mode colors for card differentiation
const modeColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  A: { bg: "bg-red-50", border: "border-red-500", label: "배틀" },
  B: { bg: "bg-blue-50", border: "border-blue-500", label: "테스트" },
  C: { bg: "bg-purple-50", border: "border-purple-500", label: "티어" },
  D: { bg: "bg-green-50", border: "border-green-500", label: "블로그" },
};

interface HomeFeedProps {
  topics: RankingTopic[];
  filterMode?: string;
}

export default function HomeFeed({ topics, filterMode = "A" }: HomeFeedProps) {
  const navigate = useNavigate();

  const sortedTopics = useMemo(() => {
    // Score and sort topics
    const scored = [...topics].map((topic) => {
      const score = scoreTopic(topic);
      const createdAt = topic.createdAt
        ? new Date(topic.createdAt)
        : new Date();
      const ageHours = Math.max(
        0,
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
      );
      const isFeatured = score > 500; // High score = featured
      const isNew = ageHours < 48; // Less than 48 hours = new

      return { topic, score, isFeatured, isNew };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Filter by mode
    const filtered = scored.filter((item) => item.topic.mode === filterMode);

    return filtered;
  }, [topics, filterMode]);

  if (sortedTopics.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-heading mb-2">아직 콘텐츠가 없어요</p>
          <p className="text-sm text-muted-foreground">
            다른 탭을 확인해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-1 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedTopics.map(({ topic, isFeatured, isNew }) => {
          const modeColor = modeColors[topic.mode] || modeColors.A;
          const topItems = topic.items
            .slice()
            .sort((a, b) => (b.eloScore || 0) - (a.eloScore || 0))
            .slice(0, 2);

          return (
            <div
              key={topic.id}
              onClick={() => navigate(getModePlayPath(topic))}
              className="cursor-pointer w-full h-full text-left"
            >
              <NeoCard
                className={`relative overflow-hidden active:translate-x-1 active:translate-y-1 active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all p-0 ${modeColor.bg} h-full`}
              >
                {/* Like and Share Buttons - Top Left */}
                <div
                  className="absolute top-2 left-2 z-10 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LikeButton
                    topicId={topic.id}
                    initialLikeCount={topic.likeCount || 0}
                    compact
                    showCount={false}
                  />
                  <ShareButton
                    url={`${window.location.origin}${getModePlayPath(topic)}`}
                    title={topic.title}
                    text={`"${topic.title}" 랭킹을 확인해보세요!`}
                    compact
                  />
                </div>

                {/* Cute Flag Badges - Top Right */}
                {(isFeatured || isNew) && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    {isFeatured && (
                      <div className="bg-yellow-400 text-xs font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
                        ⭐ HOT
                      </div>
                    )}
                    {isNew && (
                      <div className="bg-pink-400 text-white text-xs font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                        🆕 NEW
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content */}
                <div className="h-full relative">
                  {/* Images Grid */}
                  <div className="grid grid-cols-2 h-full min-h-80">
                    {topItems.map((item, idx) => {
                      // YouTube 썸네일 URL 추출
                      const youtubeUrl = item.youtubeUrl || item.youtube_url;
                      let imageUrl = item.imageUrl || item.image_url;

                      if (!imageUrl && youtubeUrl) {
                        const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/)?.[1];
                        if (videoId) {
                          imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                        }
                      }

                      return (
                        <div key={item.id} className="relative">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute bottom-0 left-0 right-0 ${
                              idx === 0 ? "bg-primary" : "bg-secondary text-white"
                            } p-2 border-t-3 border-black ${
                              idx === 0 ? "border-r-3" : "border-l-3"
                            }`}
                          >
                            <p className="font-heading text-center text-xs truncate">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t-3 border-black">
                    <div className="flex justify-between mb-1">
                      <h2 className="text-xl mb-1 font-fixel">{topic.title}</h2>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{topic.items.length}개 항목</span>
                      <span className="flex items-center gap-1">
                        ❤️ {topic.likeCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VS Badge for Battle Mode */}
                {topic.mode === "A" && (
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-accent text-accent-foreground border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-1.5 rotate-6">
                      <p className="font-heading text-xl">VS</p>
                    </div>
                  </div>
                )}
              </NeoCard>
            </div>
          );
        })}
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-4"></div>
    </div>
  );
}
