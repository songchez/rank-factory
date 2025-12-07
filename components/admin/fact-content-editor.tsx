"use client";

import { useState, useTransition } from "react";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { saveTopicContentAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

interface FactContentEditorProps {
  topicId: string;
  initialMarkdown?: string;
  enabled?: boolean;
}

export function FactContentEditor({ topicId, initialMarkdown = "", enabled = true }: FactContentEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await saveTopicContentAction(topicId, markdown);
      if (result.success) {
        setMessage("저장되었습니다.");
      } else {
        setMessage(result.error || "저장에 실패했습니다.");
      }
    });
  };

  return (
    <NeoCard className="p-6 bg-white border-3 border-black space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl">블로그 설명</h3>
          <p className="text-sm text-muted-foreground">팩트형 주제의 본문을 마크다운으로 작성하세요.</p>
        </div>
        <NeoButton onClick={handleSave} disabled={isPending || !enabled}>
          {isPending ? <Loader2 className="animate-spin" /> : "저장"}
        </NeoButton>
      </div>
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        className="w-full min-h-[220px] border-2 border-black p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
        placeholder="# 제목\n본문을 입력하세요..."
        disabled={!enabled}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {!enabled && <p className="text-xs text-red-600">팩트형(D) 주제에서만 사용 가능합니다.</p>}
    </NeoCard>
  );
}
