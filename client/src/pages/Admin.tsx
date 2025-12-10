import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchTopics, runSeed } from '../lib/api';
import { normalizeTopic } from '../lib/topics';
import { NeoCard } from '../components/neo-card';
import { NeoButton } from '../components/neo-button';

export default function Admin() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const allowedAdmins = useMemo(() => ['nschae@naver.com'], []);
  const isAdmin = user && allowedAdmins.includes(user.email || '');

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await fetchTopics();
      if (res.success && res.data) {
        setTopics(res.data.map(normalizeTopic));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleSeed = async () => {
    setSeedMessage('시드 실행 중...');
    try {
      await runSeed();
      await loadTopics();
      setSeedMessage('시드 완료! 데이터가 갱신되었습니다.');
    } catch (err) {
      console.error(err);
      setSeedMessage('시드 실패. 콘솔을 확인하세요.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">인증 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <p className="text-sm text-muted-foreground">관리자 로그인이 필요합니다.</p>
        <NeoButton onClick={() => navigate('/login')}>로그인</NeoButton>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-6">
        <p className="text-sm text-muted-foreground">접근 권한이 없습니다.</p>
        <NeoButton variant="outline" onClick={() => navigate('/')}>
          홈으로
        </NeoButton>
      </div>
    );
  }

  const grouped = topics.reduce<Record<string, any[]>>((acc, t) => {
    const mode = t.mode || 'A';
    acc[mode] = acc[mode] || [];
    acc[mode].push(t);
    return acc;
  }, {});

  const endpointList = [
    { label: '헬스체크', path: '/api/health' },
    { label: '토픽 목록', path: '/api/topics' },
    { label: '시드 실행', path: '/api/seed/all' },
    { label: '게임 리더보드', path: '/api/games/:id/leaderboard' },
    { label: '게임 점수 기록', path: '/api/games/:id/score' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase">Rank Factory Admin</p>
            <h1 className="font-heading text-3xl">콘텐츠/시드 관리</h1>
            <p className="text-sm text-slate-500 mt-1">모든 기능은 데스크톱 전용 레이아웃으로 분리되었습니다.</p>
          </div>
          <div className="flex gap-2">
            <NeoButton variant="outline" onClick={() => navigate('/')}>메인 보기</NeoButton>
            <NeoButton variant="secondary" onClick={signOut}>로그아웃</NeoButton>
          </div>
        </div>

        <NeoCard className="p-4 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap gap-3 items-center">
            <NeoButton onClick={handleSeed} disabled={loading}>
              기본 시드 채우기
            </NeoButton>
            <NeoButton variant="outline" onClick={loadTopics}>
              데이터 새로고침
            </NeoButton>
            {seedMessage && <span className="text-sm text-muted-foreground">{seedMessage}</span>}
          </div>
        </NeoCard>

        <div className="grid grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map((mode) => (
            <NeoCard key={mode} className="p-4 bg-white border-2 border-black">
              <div className="flex items-center justify-between mb-3">
                <div className="font-heading text-lg">모드 {mode}</div>
                <span className="text-xs text-muted-foreground">{grouped[mode]?.length || 0}개</span>
              </div>
              <div className="space-y-2">
                {(grouped[mode] || []).map((topic) => (
                  <div key={topic.id} className="border border-black/20 px-3 py-2 rounded">
                    <div className="font-heading text-sm">{topic.title}</div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{topic.items.length}개 항목</span>
                      <span>{topic.view_type}</span>
                    </div>
                  </div>
                ))}
                {(grouped[mode] || []).length === 0 && (
                  <p className="text-xs text-muted-foreground">아직 데이터가 없습니다.</p>
                )}
              </div>
            </NeoCard>
          ))}
        </div>

        <NeoCard className="p-4 bg-white border-2 border-black">
          <h2 className="font-heading text-lg mb-3">엔드포인트 체크</h2>
          <div className="grid grid-cols-2 gap-2">
            {endpointList.map((ep) => (
              <div key={ep.path} className="flex items-center justify-between border border-black/10 px-3 py-2 rounded">
                <span className="text-sm">{ep.label}</span>
                <code className="text-xs bg-slate-100 px-2 py-1 border border-black/10 rounded">{ep.path}</code>
              </div>
            ))}
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
