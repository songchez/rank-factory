"use client";

import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { RankingTopic } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { getModePlayPath } from "@/lib/topics";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Noto_Sans_KR } from "next/font/google";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export function FactClient({ topic }: { topic: RankingTopic }) {
  const source = (topic.meta as any)?.source || "데이터 소스 미설정";
  const updatedAt = (topic.meta as any)?.lastSyncedAt;
  const isFact = topic.mode === "D";
  const items = [...topic.items].sort((a, b) => {
    const rankA = a.rankOrder ?? 0;
    const rankB = b.rankOrder ?? 0;
    if (rankA !== rankB && (rankA > 0 || rankB > 0)) {
      return (rankA || Number.MAX_SAFE_INTEGER) - (rankB || Number.MAX_SAFE_INTEGER);
    }
    return b.eloScore - a.eloScore;
  });
  const body = topic.contentMarkdown;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Type D · 팩트형</p>
          <h1 className="font-heading text-3xl">{topic.title}</h1>
          <p className="text-sm text-muted-foreground">
            {topic.category} • {source}
          </p>
          {updatedAt && (
            <p className="text-xs text-muted-foreground">업데이트: {updatedAt}</p>
          )}
        </div>
        <Link href={getModePlayPath(topic)}>
          <NeoButton variant="outline" size="sm">
            새로고침
          </NeoButton>
        </Link>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <NeoCard key={item.id} className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="font-heading text-3xl w-12 text-center">#{index + 1}</div>
              <div className="relative w-20 h-20 border-2 border-black flex-shrink-0">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {isFact
                    ? `지정 순위 ${item.rankOrder ?? "-"}`
                    : `ELO ${item.eloScore}`}
                </p>
              </div>
              <div className="text-right text-sm">
                {!isFact ? (
                  <>
                    <div>
                      승 {item.winCount} / 패 {item.lossCount}
                    </div>
                    <div className="text-muted-foreground">총 {item.matchCount}판</div>
                  </>
                ) : (
                  <div className="text-muted-foreground">수동 순위</div>
                )}
              </div>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {item.description && item.description.trim().length > 0
                ? item.description
                : "설명 준비 중입니다."}
            </div>
            {item.externalUrl && (
              <Link href={item.externalUrl} className="text-xs underline text-primary" target="_blank">
                출처 보기
              </Link>
            )}
          </NeoCard>
        ))}
      </div>

      {body && (
        <section className="mt-8 flex justify-center">
          <div className="w-full max-w-2xl bg-transparent">
            <div
              className={`p-1 md:p-2 rounded-2xl bg-gradient-to-r from-transparent via-white/60 to-transparent ${notoSans.className}`}
            >
              {/*
                Force all markdown elements to use the content font instead of the global heading font.
              */}
              {(() => {
                const fontStyle = { fontFamily: notoSans.style.fontFamily };
                return (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                    <h1
                      style={fontStyle}
                      className="text-3xl md:text-4xl mb-4 mt-6 leading-relaxed font-bold text-indigo-900 tracking-normal"
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      style={fontStyle}
                      className="text-2xl md:text-3xl mb-3 mt-5 leading-relaxed font-semibold text-indigo-800 tracking-normal"
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      style={fontStyle}
                      className="text-xl md:text-2xl mb-2 mt-4 leading-relaxed font-semibold text-indigo-700 tracking-normal"
                    >
                      {children}
                    </h3>
                  ),
                    p: ({ children }) => (
                      <p style={fontStyle} className="text-base leading-relaxed mb-3 tracking-normal">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul style={fontStyle} className="list-disc pl-6 mb-3 space-y-1 tracking-normal">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={fontStyle} className="list-decimal pl-6 mb-3 space-y-1 tracking-normal">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li style={fontStyle} className="leading-relaxed tracking-normal">
                        {children}
                      </li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        style={fontStyle}
                        className="border-l-4 border-primary/60 pl-3 italic text-muted-foreground my-4"
                      >
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-3 rounded border border-border overflow-x-auto text-sm font-mono">{children}</pre>
                  ),
                }}
                >
                  {body}
                </ReactMarkdown>
                );
              })()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
