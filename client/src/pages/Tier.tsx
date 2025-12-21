import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTopic } from '../hooks/useTopic';
import { NeoCard } from '../components/neo-card';
import { NeoButton } from '../components/neo-button';
import { ShareButton } from '../components/share-button';

const tierLabels = ['S', 'A', 'B', 'C', 'F'] as const;

export default function Tier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error, reload } = useTopic(id);

  const grouped = useMemo(() => {
    if (!topic) return {};
    const groups: Record<string, typeof topic.items> = {};
    tierLabels.forEach((tier) => (groups[tier] = []));

    topic.items.forEach((item) => {
      const tier = tierLabels[(item.rankOrder || 3) - 1] || 'C';
      groups[tier] = [...(groups[tier] || []), item];
    });
    return groups;
  }, [topic]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">티어판 준비 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">티어 정보를 불러오지 못했습니다.</p>
        <NeoButton variant="outline" onClick={reload}>
          다시 시도
        </NeoButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase">{topic.category}</p>
            <h1 className="font-heading text-2xl">{topic.title}</h1>
            <p className="text-xs text-muted-foreground">나만의 티어를 참고해보세요</p>
          </div>
          <div className="flex gap-2">
            <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
              홈
            </NeoButton>
            <ShareButton
              compact
              showLabel
              title={topic.title}
              text={`티어 랭킹을 확인해보세요!`}
            />
          </div>
        </div>

        <div className="space-y-3">
          {tierLabels.map((tier) => (
            <NeoCard key={tier} className="p-3 space-y-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-primary font-heading text-lg">
                  {tier}
                </div>
                <div className="font-heading text-lg">
                  {tier} Tier · {grouped[tier]?.length ?? 0}개
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(grouped[tier] || []).map((item) => (
                  <div key={item.id} className="border-2 border-black bg-muted px-3 py-2 rounded">
                    <div className="font-heading text-sm">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground">{item.description}</div>
                  </div>
                ))}
                {(grouped[tier] || []).length === 0 && (
                  <div className="text-xs text-muted-foreground pl-1">아직 비어있어요</div>
                )}
              </div>
            </NeoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
