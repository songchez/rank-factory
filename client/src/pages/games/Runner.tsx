import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '../../components/games/game-layout';
import { RunnerClient } from '../../components/games/runner-client';
import { fetchLeaderboard } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const GAME_ID = 'runner';

export default function Runner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const locked = !user;
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { data } = await fetchLeaderboard(GAME_ID, 20);
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [key]);

  const handleStart = () => {
    if (locked) return;
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleRestart = () => {
    if (locked) return;
    setGameStarted(true);
    setGameEnded(false);
    setKey(prev => prev + 1);
  };

  return (
    <GameLayout
      gameTitle="달려라 픽셀냥"
      gameIcon="🐱"
      isGameStarted={gameStarted}
      isGameEnded={gameEnded}
      onStart={!locked ? handleStart : undefined}
      onRestart={!locked ? handleRestart : undefined}
    >
      {locked && !gameStarted && (
        <div className="text-center text-sm text-muted-foreground mb-2 space-y-2">
          <div>로그인 후 플레이할 수 있습니다.</div>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex px-3 py-1.5 border-2 border-black bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-bold"
          >
            로그인하기
          </button>
        </div>
      )}
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <RunnerClient
          key={key}
          leaderboard={leaderboard}
          gameStarted={gameStarted}
          onGameEnd={() => setGameEnded(true)}
          locked={locked}
        />
      )}
    </GameLayout>
  );
}
