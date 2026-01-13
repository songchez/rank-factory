import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '../../components/games/game-layout';
import { IronPawPhaserGame } from '../../components/games/ironpaw-phaser/IronPawPhaserGame';
import { fetchLeaderboard } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const GAME_ID = 'ironpaw-survival';

export default function IronPawSurvival() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleRestart = () => {
    setGameStarted(true);
    setGameEnded(false);
    setKey(prev => prev + 1);
  };

  return (
    <GameLayout
      gameTitle="아이언포 서바이벌"
      gameIcon="🐱"
      isGameStarted={gameStarted}
      isGameEnded={gameEnded}
      onStart={handleStart}
    >
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <IronPawPhaserGame
          key={key}
          leaderboard={leaderboard}
          gameStarted={gameStarted}
          onGameEnd={() => setGameEnded(true)}
          onRestart={handleRestart}
          isLoggedIn={!!user}
          onLoginPrompt={() => navigate('/login')}
        />
      )}
    </GameLayout>
  );
}
