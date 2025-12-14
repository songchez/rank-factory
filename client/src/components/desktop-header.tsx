import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NeoButton } from './neo-button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function DesktopHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const avatarLabel = user?.email?.slice(0, 1).toUpperCase() || 'G';
  const avatarImage = user?.user_metadata?.avatar_url;

  return (
    <header className="hidden md:flex items-center justify-between py-3">
      <Link to="/" className="font-heading text-xl">
        Rank Factory
      </Link>
      <div className="flex items-center gap-3">
        <NeoButton variant="outline" size="sm" onClick={() => navigate('/games')}>
          게임
        </NeoButton>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpen((v) => !v)} className="focus:outline-none">
            <Avatar>
              {avatarImage && <AvatarImage src={avatarImage} alt={user?.email} />}
              <AvatarFallback>{avatarLabel}</AvatarFallback>
            </Avatar>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-black/10 bg-white shadow-md z-20">
              <div className="px-3 py-2 border-b border-black/10 text-sm">
                {user ? user.email : '게스트'}
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                >
                  내 정보
                </button>
                {user ? (
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await signOut();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  >
                    로그아웃
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  >
                    로그인
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DesktopHeader;
