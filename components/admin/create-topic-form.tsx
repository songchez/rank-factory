"use client";

import { useState } from "react";
import { createTopicAction } from "@/lib/actions";
import { NeoButton } from "@/components/neo-button";
import { NeoCard } from "@/components/neo-card";
import { Loader2 } from "lucide-react";

export function CreateTopicForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const result = await createTopicAction(title, category);
    setIsLoading(false);

    if (result.success) {
      setTitle("");
      alert("주제가 생성되었습니다!");
    } else {
      alert("생성 실패: " + result.error);
    }
  };

  return (
    <NeoCard className="mb-8">
      <h2 className="font-heading text-2xl mb-4">새 주제 만들기</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="예: 최고의 프로그래밍 언어"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="General">일반</option>
            <option value="Food">음식</option>
            <option value="Tech">기술</option>
            <option value="Game">게임</option>
            <option value="Entertain">연예</option>
          </select>
        </div>
        <NeoButton type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : "생성하기"}
        </NeoButton>
      </form>
    </NeoCard>
  );
}
