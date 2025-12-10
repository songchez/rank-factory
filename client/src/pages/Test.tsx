import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTopic } from '../hooks/useTopic';
import { NeoCard } from '../components/neo-card';
import { NeoButton } from '../components/neo-button';
import { useAuth } from '../hooks/useAuth';

type Choice = { text: string; weight: number };
type Question = { id: string; prompt: string; choices: Choice[] };

export default function Test() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error, reload } = useTopic(id);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { user } = useAuth();
  const locked = !user;

  const questions: Question[] = useMemo(() => {
    const metaQuestions = ((topic?.meta as any)?.questions || []) as any[];
    if (metaQuestions.length > 0) {
      return metaQuestions.map((q, idx) => ({
        id: q.id || `q-${idx}`,
        prompt: q.prompt,
        choices: q.choices?.map((c: any) => ({ text: c.text, weight: Number(c.weight) || 0 })) || [],
      }));
    }

    return (topic?.items || []).slice(0, 5).map((item, idx) => ({
      id: item.id || `fallback-${idx}`,
      prompt: `${item.name}가 눈앞에 있다면?`,
      choices: [
        { text: '무조건 YES', weight: 4 },
        { text: '가끔 생각난다', weight: 2 },
        { text: 'PASS', weight: 1 },
      ],
    }));
  }, [topic]);

  const results = useMemo(() => {
    const metaResults = ((topic?.meta as any)?.results || []) as any[];
    return metaResults.sort((a, b) => b.threshold - a.threshold);
  }, [topic]);

  const totalQuestions = Math.max(questions.length, 1);

  const handleChoice = (choice: Choice) => {
    if (locked) return;
    const nextScore = score + choice.weight;
    const lastQuestion = index >= questions.length - 1;
    if (lastQuestion) {
      setScore(nextScore);
      setFinished(true);
      return;
    }
    setScore(nextScore);
    setIndex((i) => i + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">테스트 세팅 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">테스트 데이터를 불러오지 못했습니다.</p>
        <NeoButton variant="outline" onClick={reload}>
          다시 시도
        </NeoButton>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">테스트 문항이 아직 준비되지 않았어요.</p>
        <NeoButton variant="outline" onClick={() => navigate('/')}>
          홈으로
        </NeoButton>
      </div>
    );
  }

  const progress = Math.round(((index + (finished ? 1 : 0)) / totalQuestions) * 100);
  const result = finished
    ? results.find((r: any) => score >= r.threshold) ?? {
        label: '기본형',
        summary: '조금 더 탐색해보세요!',
      }
    : null;

  return (
    <div className="min-h-screen bg-background px-3 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">{topic.category}</p>
          <h1 className="font-heading text-2xl">{topic.title}</h1>
          <p className="text-xs text-muted-foreground">
            질문 {questions.length}개 · 점수 {score}
          </p>
        </div>
        <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
          홈
        </NeoButton>
      </div>

      {locked && (
        <NeoCard className="p-3 bg-white border-dashed border-2 border-black/50 text-sm text-muted-foreground">
          <div className="mb-2">로그인 후 테스트에 참여할 수 있습니다. 우측 하단 로그인 탭을 이용하세요.</div>
          <NeoButton size="sm" onClick={() => navigate('/login')}>
            로그인하기
          </NeoButton>
        </NeoCard>
      )}

      <div className="w-full h-2 bg-muted border-2 border-black rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      {!finished ? (
        <NeoCard className="p-4 space-y-3">
          <div className="text-xs text-muted-foreground">Q{index + 1}/{questions.length}</div>
          <div className="font-heading text-lg leading-snug">{questions[index].prompt}</div>
          <div className="grid gap-2">
            {questions[index].choices.map((choice) => (
              <button
                key={choice.text}
                onClick={() => handleChoice(choice)}
                disabled={locked}
                className={`border-2 border-black bg-white hover:bg-primary/40 active:translate-y-0.5 transition-all px-3 py-3 text-left ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="font-heading">{choice.text}</div>
              </button>
            ))}
          </div>
        </NeoCard>
      ) : (
        <NeoCard className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">테스트 결과</p>
          <h2 className="font-heading text-xl">{result?.label}</h2>
          <p className="text-sm text-muted-foreground">{result?.summary}</p>
          <NeoButton className="w-full" onClick={() => { setIndex(0); setScore(0); setFinished(false); }}>
            다시 하기
          </NeoButton>
        </NeoCard>
      )}
    </div>
  );
}
