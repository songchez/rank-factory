import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NeoButton } from '../components/neo-button';

export default function Profile() {
  const { user, loading, refreshSession, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      refreshSession();
    }
  }, [user, loading, refreshSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
        <NeoButton onClick={() => navigate('/login')}>로그인</NeoButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">내 정보</p>
            <h1 className="font-heading text-2xl">프로필</h1>
          </div>
          <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
            홈으로
          </NeoButton>
        </div>

        <div className="rounded-xl border border-black/10 bg-white/80 p-4 space-y-3 max-w-2xl">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">이메일</p>
            <p className="text-base font-heading">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <NeoButton variant="secondary" onClick={async () => { await signOut(); navigate('/login'); }}>
              로그아웃
            </NeoButton>
            <NeoButton variant="outline" onClick={() => navigate('/')}>
              홈으로
            </NeoButton>
          </div>
        </div>
      </main>
    </div>
  );
}
