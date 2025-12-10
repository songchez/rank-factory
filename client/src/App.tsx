import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MobileNav } from './components/mobile-nav';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Ranking from './pages/Ranking';
import Battle from './pages/Battle';
import Tier from './pages/Tier';
import Fact from './pages/Fact';
import Test from './pages/Test';
import GamesList from './pages/games/GamesList';
import Tetris from './pages/games/Tetris';
import Reaction from './pages/games/Reaction';
import ColorMatch from './pages/games/ColorMatch';
import Runner from './pages/games/Runner';
import TenSeconds from './pages/games/TenSeconds';
import FeatherFlight from './pages/games/FeatherFlight';

function AppShell() {
  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/admin');
  const isGameFullScreen = location.pathname.startsWith('/games/');
  const isBattleFullScreen = location.pathname.startsWith('/battle/');
  const shellClass = isAdminView || isGameFullScreen || isBattleFullScreen ? 'full-shell' : 'app-shell';
  const showMobileNav = !isAdminView && !isGameFullScreen && !isBattleFullScreen;

  return (
    <div className={shellClass}>
      <div className={showMobileNav ? 'pb-16' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/ranking/:id" element={<Ranking />} />
          <Route path="/battle/:id" element={<Battle />} />
          <Route path="/tier/:id" element={<Tier />} />
          <Route path="/fact/:id" element={<Fact />} />
          <Route path="/test/:id" element={<Test />} />
          <Route path="/games" element={<GamesList />} />
          <Route path="/games/tetris" element={<Tetris />} />
          <Route path="/games/reaction" element={<Reaction />} />
          <Route path="/games/color-match" element={<ColorMatch />} />
          <Route path="/games/runner" element={<Runner />} />
          <Route path="/games/ten-seconds" element={<TenSeconds />} />
          <Route path="/games/feather-flight" element={<FeatherFlight />} />
        </Routes>
      </div>
      {showMobileNav && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
