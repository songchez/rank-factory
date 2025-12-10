import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NeoButton } from '../components/neo-button';

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(email, password);
    if (!result.success) {
      setLocalError(result.error || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">접속</p>
          <h1 className="font-heading text-3xl">로그인</h1>
          <p className="text-sm text-muted-foreground mt-1">
            랭킹공장 미니게임과 관리자 도구에 접속합니다.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-3 border-black focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-3 border-black focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          {(error || localError) && (
            <div className="text-red-600 text-sm font-bold">
              {error || localError}
            </div>
          )}

          <NeoButton
            type="submit"
            className="w-full bg-primary text-foreground"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </NeoButton>
        </form>
      </div>
    </div>
  );
}
