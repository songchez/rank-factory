import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HomeFeed from '../components/home-feed';
import { NeoButton } from '../components/neo-button';
import { fetchTopics } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { normalizeTopic } from '../lib/topics';

export default function Home() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const filterMode = searchParams.get('mode') || 'A'; // Default to 배틀형

  useEffect(() => {
    let cancelled = false;

    fetchTopics()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setTopics(res.data.map(normalizeTopic));
        } else {
          setError('토픽을 불러오지 못했습니다.');
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = useMemo(() => ([
    { key: 'A', label: '배틀', desc: '둘 중 하나만 고르기' },
    { key: 'B', label: '테스트', desc: '질문에 답하고 결과 확인' },
    { key: 'C', label: '티어', desc: '등급을 매겨보는 시간' },
    { key: 'D', label: '팩트', desc: '리스트/아카이브' },
  ]), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">데이터 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-2xl">오류가 발생했습니다</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a href="/api/seed/all" target="_blank" rel="noopener noreferrer">
            <NeoButton>데이터 다시 채우기</NeoButton>
          </a>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-2xl">콘텐츠가 아직 없어요</h1>
          <p className="text-sm text-muted-foreground">
            관리자 페이지에서 기본 데이터를 채워주세요.
          </p>
          <a href="/api/seed/all" target="_blank" rel="noopener noreferrer">
            <NeoButton className="mt-2">기본 시드 실행</NeoButton>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-4 pb-6 space-y-4 px-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground tracking-wide">랭킹공장</p>
            <h1 className="font-heading text-2xl">오늘의 투표</h1>
            <p className="text-xs text-muted-foreground">모바일에 맞춘 카드형 피드</p>
          </div>
          <div className="flex gap-2">
            <NeoButton variant="outline" size="sm" onClick={() => navigate('/games')}>
              🎮 게임
            </NeoButton>
            {!user && (
              <NeoButton variant="outline" size="sm" onClick={() => navigate('/login')}>
                로그인
              </NeoButton>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(`/?mode=${tab.key}`)}
              className={`rounded-md border-2 border-black px-2 py-2 text-left transition-all ${
                filterMode === tab.key
                  ? 'bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-muted'
              }`}
            >
              <div className="font-heading text-sm">{tab.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{tab.desc}</div>
            </button>
          ))}
        </div>

        <HomeFeed topics={topics} filterMode={filterMode} />
      </main>
    </div>
  );
}
