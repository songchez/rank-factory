"use client";

import { useMemo, useState } from "react";
import { NeoCard } from "@/components/neo-card";
import { NeoButton } from "@/components/neo-button";
import { RankingTopic } from "@/lib/types";
import { submitQuizAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  weight: number;
  type: "OX" | "MCQ";
};

function buildQuestions(topic: RankingTopic): QuizQuestion[] {
  const metaQuestions = (topic.meta as any)?.quizQuestions;

  if (Array.isArray(metaQuestions) && metaQuestions.length > 0) {
    return metaQuestions.map((q: any, idx: number) => ({
      id: q.id || `q-${idx}`,
      prompt: q.prompt || q.title || `문항 ${idx + 1}`,
      choices: q.choices && Array.isArray(q.choices) ? q.choices : ["좋다", "별로"],
      weight: Number(q.weight) || 10,
      type: q.type === "MCQ" ? "MCQ" : "OX",
    }));
  }

  return topic.items.slice(0, 10).map((item, idx) => ({
    id: item.id,
    prompt: `${item.name} 얼마나 끌리나요?`,
    choices: ["완전 끌림", "보통", "별로"],
    weight: 10 - idx,
    type: "MCQ",
  }));
}

function scoreAnswers(questions: QuizQuestion[], answers: Record<string, string>) {
  return questions.reduce((sum, question) => {
    const answer = answers[question.id];
    if (!answer) return sum;

    const weight = question.weight || 1;
    if (question.type === "OX") {
      return sum + (answer === question.choices[0] ? weight : 0);
    }

    const choiceIndex = question.choices.findIndex((c) => c === answer);
    if (choiceIndex < 0) return sum;
    const scoreFromChoice = Math.max(weight - choiceIndex * 2, 0);
    return sum + scoreFromChoice;
  }, 0);
}

export function TestClient({ topic }: { topic: RankingTopic }) {
  const questions = useMemo(() => buildQuestions(topic), [topic]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; percentile: number } | null>(null);

  const maxScore = useMemo(
    () => questions.reduce((sum, q) => sum + q.weight, 0),
    [questions]
  );

  const handleSelect = async (choice: string) => {
    const nextAnswers = { ...answers, [questions[currentIndex].id]: choice };
    setAnswers(nextAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    await finalize(nextAnswers);
  };

  const finalize = async (finalAnswers: Record<string, string>) => {
    const score = scoreAnswers(questions, finalAnswers);
    const estimatedPercentile =
      maxScore > 0 ? Math.min(100, Math.max(0, Math.round((score / maxScore) * 100))) : 0;

    setIsSubmitting(true);
    setResult({ score, percentile: estimatedPercentile });

    try {
      const response = await submitQuizAction(topic.id, score, { answers: finalAnswers });
      if (response?.percentile !== undefined) {
        setResult({ score, percentile: response.percentile });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Type B · 진단형</p>
          <h1 className="font-heading text-3xl">{topic.title}</h1>
          <p className="text-sm text-muted-foreground">{topic.category}</p>
        </div>
        <NeoButton variant="outline" size="sm" onClick={reset}>
          처음부터
        </NeoButton>
      </div>

      {!result ? (
        <NeoCard className="p-6 border-3 border-black bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="font-heading text-xl">
              Q{currentIndex + 1}. {questions[currentIndex].prompt}
            </div>
            <div className="text-sm font-bold">{progress}%</div>
          </div>
          <div className="space-y-3">
            {questions[currentIndex].choices.map((choice) => (
              <button
                key={choice}
                className={cn(
                  "w-full text-left border-2 border-black px-4 py-3 text-base transition-all",
                  answers[questions[currentIndex].id] === choice
                    ? "bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:bg-gray-50"
                )}
                onClick={() => handleSelect(choice)}
                disabled={isSubmitting}
              >
                {choice}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>선택지를 누르면 자동으로 다음 문항으로 넘어갑니다.</span>
            <span>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </NeoCard>
      ) : (
        <NeoCard className="p-6 border-3 border-black bg-white">
          <p className="text-sm text-muted-foreground mb-2">진단 결과</p>
          <h2 className="font-heading text-4xl mb-4">{topic.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <NeoCard className="bg-primary text-center">
              <p className="text-sm text-muted-foreground">총점</p>
              <p className="font-heading text-4xl">{result.score}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                최대 {maxScore}점
              </p>
            </NeoCard>
            <NeoCard className="bg-secondary text-secondary-foreground text-center">
              <p className="text-sm text-muted-foreground">백분위</p>
              <p className="font-heading text-4xl">{result.percentile}%</p>
              <p className="text-xs mt-1 text-muted-foreground">상위 퍼센트</p>
            </NeoCard>
            <NeoCard className="bg-accent text-center">
              <p className="text-sm text-muted-foreground">문항 수</p>
              <p className="font-heading text-4xl">{questions.length}</p>
              <p className="text-xs mt-1 text-muted-foreground">체크 완료</p>
            </NeoCard>
          </div>
          <div className="flex flex-wrap gap-3">
            <NeoButton onClick={reset} disabled={isSubmitting}>
              다시 풀기
            </NeoButton>
            <NeoButton variant="outline" onClick={() => window.location.reload()}>
              새로고침
            </NeoButton>
          </div>
        </NeoCard>
      )}
    </div>
  );
}
