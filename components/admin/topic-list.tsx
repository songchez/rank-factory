"use client";

import { useState } from "react";
import Link from "next/link";
import { RankingTopic } from "@/lib/types";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface TopicListProps {
  initialTopics: RankingTopic[];
  total: number;
}

export function TopicList({ initialTopics, total }: TopicListProps) {
  // In a real app with server-side pagination, we would use URL search params.
  // For simplicity here, we are just displaying the initial page, but the UI supports the concept.
  // To fully implement server-side pagination, we'd need to trigger a router.push with ?page=2
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl">주제 목록 ({total})</h2>
        <Link href="/admin/topics/new">
          <NeoButton className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> 새 주제
          </NeoButton>
        </Link>
      </div>

      <div className="grid gap-4">
        {initialTopics.map((topic) => (
          <NeoCard key={topic.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-primary px-2 py-0.5 border border-black rounded-full">
                  {topic.category}
                </span>
                <h3 className="font-bold text-lg">{topic.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                항목 {topic.items.length}개 • {new Date(topic.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link href={`/admin/topics/${topic.id}`}>
              <NeoButton size="sm" variant="outline">
                관리
              </NeoButton>
            </Link>
          </NeoCard>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <NeoButton
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4" />
          </NeoButton>
          <span className="flex items-center font-bold">
            {page} / {totalPages}
          </span>
          <NeoButton
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            size="sm"
            variant="outline"
          >
            <ChevronRight className="w-4 h-4" />
          </NeoButton>
        </div>
      )}
    </div>
  );
}
