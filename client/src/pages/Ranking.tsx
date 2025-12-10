import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTopic } from '../hooks/useTopic';
import { NeoCard } from '../components/neo-card';
import { NeoButton } from '../components/neo-button';

export default function Ranking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error, reload } = useTopic(id);

  const rankedItems = useMemo(() => {
    if (!topic) return [];
    return [...topic.items].sort((a, b) => (b.eloScore || 0) - (a.eloScore || 0));
  }, [topic]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">랭킹 계산 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">랭킹을 불러오지 못했습니다.</p>
        <NeoButton variant="outline" onClick={reload}>
          다시 시도
        </NeoButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">{topic.category}</p>
          <h1 className="font-heading text-2xl">{topic.title}</h1>
          <p className="text-xs text-muted-foreground">총 {rankedItems.length}개 항목</p>
        </div>
        <NeoButton variant="outline" size="sm" onClick={() => navigate(`/battle/${topic.id}`)}>
          투표하러 가기
        </NeoButton>
      </div>

      <NeoCard className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div>순위</div>
          <div>이름</div>
          <div>점수</div>
        </div>
        <div className="divide-y divide-black/10">
          {rankedItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-3 gap-2 py-3 items-center">
              <div className="font-heading text-lg text-center">#{index + 1}</div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 border-2 border-black overflow-hidden bg-muted">
                  <img src={item.imageUrl || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-heading text-sm">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    승 {item.winCount} / 패 {item.lossCount} · 경기 {item.matchCount}
                  </div>
                </div>
              </div>
              <div className="text-right font-bold">{item.eloScore}</div>
            </div>
          ))}
        </div>
      </NeoCard>
    </div>
  );
}
