import { Link, useLocation } from 'react-router-dom';
import { NeoButton } from './neo-button';
import { UserMenu } from './user-menu';
import { useAuth } from '../hooks/useAuth';

export function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b-3 border-black bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-heading text-2xl md:text-3xl">랭킹공장</div>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link to="/login">
                <NeoButton variant="primary" size="sm">
                  로그인
                </NeoButton>
              </Link>
            )}
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-3">
          <Link to="/">
            <NeoButton
              variant={isActive('/') ? 'primary' : 'outline'}
              size="sm"
            >
              홈
            </NeoButton>
          </Link>
          <Link to="/games">
            <NeoButton
              variant={isActive('/games') ? 'primary' : 'outline'}
              size="sm"
            >
              미니게임
            </NeoButton>
          </Link>
          {user?.email === 'nschae@naver.com' && (
            <Link to="/admin">
              <NeoButton
                variant={isActive('/admin') ? 'primary' : 'outline'}
                size="sm"
              >
                관리자
              </NeoButton>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
