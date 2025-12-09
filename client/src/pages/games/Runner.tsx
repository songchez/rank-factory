import { useEffect, useState } from 'react';
import { GameLayout } from '../../components/games/game-layout';
import { RunnerClient } from '../../components/games/runner-client';
import { supabase } from '../../lib/supabase';

const GAME_ID = 'runner';

export default function Runner() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await supabase
          .from('game_scores')
          .select('*')
          .eq('game_id', GAME_ID)
          .order('score', { ascending: false })
          .limit(20);

        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
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
      gameTitle="달려라 픽셀냥"
      gameIcon="🐱"
      isGameStarted={gameStarted}
      isGameEnded={gameEnded}
      onStart={handleStart}
      onRestart={handleRestart}
    >
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
        />
      )}
    </GameLayout>
  );
}
