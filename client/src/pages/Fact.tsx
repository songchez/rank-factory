import { useNavigate, useParams } from 'react-router-dom';
import { useTopic } from '../hooks/useTopic';
import { NeoCard } from '../components/neo-card';
import { NeoButton } from '../components/neo-button';

export default function Fact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topic, loading, error, reload } = useTopic(id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">팩트 시트 로딩 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">데이터를 불러오지 못했습니다.</p>
        <NeoButton variant="outline" onClick={reload}>
          다시 시도
        </NeoButton>
      </div>
    );
  }

  const meta = (topic.meta || {}) as any;

  return (
    <div className="min-h-screen bg-background px-3 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase">{topic.category}</p>
          <h1 className="font-heading text-2xl">{topic.title}</h1>
          <p className="text-xs text-muted-foreground">
            {meta?.source || '출처 미등록'} · 업데이트 {meta?.lastSyncedAt ? new Date(meta.lastSyncedAt).toLocaleDateString() : '미정'}
          </p>
        </div>
        <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
          홈
        </NeoButton>
      </div>

      <NeoCard className="p-3 space-y-2 bg-white">
        {topic.items.map((item, index) => (
          <div key={item.id} className="flex gap-3 border-2 border-black/10 rounded p-2">
            <div className="font-heading w-8 text-center text-lg">#{index + 1}</div>
            <div className="w-16 h-16 border-2 border-black overflow-hidden bg-muted flex-shrink-0">
              <img src={item.imageUrl || item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-heading text-base">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.description || '설명이 곧 추가됩니다.'}</div>
            </div>
          </div>
        ))}
      </NeoCard>

      {meta?.body && (
        <NeoCard className="p-3 bg-white">
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{meta.body}</div>
        </NeoCard>
      )}
    </div>
  );
}
