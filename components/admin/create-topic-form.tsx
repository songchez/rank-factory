"use client";

import { useState } from "react";
import { createTopicAction, generateTopicWithAIAction } from "@/lib/actions";
import { NeoButton } from "@/components/neo-button";
import { NeoCard } from "@/components/neo-card";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { type TopicMode } from "@/lib/types";

export function CreateTopicForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [mode, setMode] = useState<TopicMode>("A");
  const [isLoading, setIsLoading] = useState(false);

  // AI State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    const result = await createTopicAction(title, category, mode);
    setIsLoading(false);

    if (result.success) {
      setTitle("");
      alert("주제가 생성되었습니다!");
      router.push(`/admin/topics/${result.topic.id}`);
    } else {
      alert("생성 실패: " + result.error);
    }
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsLoading(true);
    const result = await generateTopicWithAIAction(aiPrompt, mode);
    setIsLoading(false);

    if (result.success) {
      setAiPrompt("");
      alert("AI가 주제와 항목을 생성했습니다!");
      router.push(`/admin/topics/${result.topicId}`);
    } else {
      alert("AI 생성 실패: " + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <NeoButton 
          variant={!isAiMode ? "primary" : "outline"}
          onClick={() => setIsAiMode(false)}
          className="flex-1"
        >
          수동 생성
        </NeoButton>
        <NeoButton 
          variant={isAiMode ? "primary" : "outline"}
          onClick={() => setIsAiMode(true)}
          className="flex-1 gap-2 flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4" /> AI 자동 생성
        </NeoButton>
      </div>

      {!isAiMode ? (
        <NeoCard>
          <h2 className="font-heading text-2xl mb-4">새 주제 만들기 (수동)</h2>
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
            <div>
              <label className="block text-sm font-bold mb-2">모드 선택</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: "A", label: "배틀형 (VS)", desc: "1:1 투표 · ELO" },
                  { code: "B", label: "진단형 (Test)", desc: "문항 점수 · 백분위" },
                  { code: "C", label: "티어형 (Tier)", desc: "드래그 & 드롭" },
                  { code: "D", label: "팩트형 (List)", desc: "데이터 리스트" },
                ].map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setMode(option.code as TopicMode)}
                    className={`text-left border-2 border-black p-3 transition-all ${
                      mode === option.code ? "bg-primary/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-heading text-lg">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <NeoButton type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "생성하기"}
            </NeoButton>
          </form>
        </NeoCard>
      ) : (
        <NeoCard className="border-primary">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> AI로 주제 생성하기
          </h2>
          <p className="text-gray-600 mb-4">
            원하는 주제를 입력하면 AI가 제목, 카테고리, 그리고 랭킹 항목들을 자동으로 생성합니다.
            이미지도 함께 생성됩니다.
          </p>
          <form onSubmit={handleAiGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">프롬프트</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                placeholder="예: 한국에서 가장 인기 있는 라면 TOP 10을 만들어줘"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: "A", label: "배틀형 (VS)", desc: "VS 모드 · ELO" },
                { code: "B", label: "진단형 (Test)", desc: "문항 점수 · 백분위" },
                { code: "C", label: "티어형 (Tier)", desc: "드래그 & 드롭" },
                { code: "D", label: "팩트형 (List)", desc: "리스트 뷰" },
              ].map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setMode(option.code as TopicMode)}
                  className={`text-left border-2 border-black p-3 transition-all ${
                    mode === option.code ? "bg-primary/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="font-heading text-lg">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </button>
              ))}
            </div>
            <NeoButton type="submit" disabled={isLoading} className="w-full bg-primary text-black hover:bg-primary/90">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> AI가 생각중입니다...
                </div>
              ) : (
                "AI로 생성하기"
              )}
            </NeoButton>
          </form>
        </NeoCard>
      )}
    </div>
  );
}
