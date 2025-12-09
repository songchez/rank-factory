import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const modes = ['A', 'B', 'C'];
  const currentMode = searchParams.get('mode') || 'A';

  const isActive = (path: string) => {
    if (path === '/games') return location.pathname === '/games';
    if (path.includes('mode=')) {
      const mode = path.split('mode=')[1];
      return location.pathname === '/' && currentMode === mode;
    }
    return location.pathname === path;
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (location.pathname === '/') {
      const currentIndex = modes.indexOf(currentMode);

      if (isLeftSwipe && currentIndex < modes.length - 1) {
        navigate(`/?mode=${modes[currentIndex + 1]}`);
      }
      if (isRightSwipe && currentIndex > 0) {
        navigate(`/?mode=${modes[currentIndex - 1]}`);
      }
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, currentMode]);

  const navItems = [
    { path: '/?mode=A', label: '배틀', icon: '⚔️', mode: 'A' },
    { path: '/?mode=B', label: '테스트', icon: '📝', mode: 'B' },
    { path: '/?mode=C', label: '티어', icon: '🏆', mode: 'C' },
    { path: '/games', label: '게임', icon: '🎮', mode: null },
    { path: user ? '/admin' : '/login', label: user ? '관리' : '로그인', icon: user ? '⚙️' : '👤', mode: null },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t-3 border-black">
      <div className="grid grid-cols-5 gap-0">
        {navItems.map((item, idx) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-2 ${
              isActive(item.path)
                ? 'bg-primary border-black'
                : 'bg-background hover:bg-gray-50'
            } ${
              idx > 0 ? 'border-l-2 border-black' : ''
            } transition-colors`}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            <span className={`text-[10px] font-bold ${isActive(item.path) ? 'text-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
