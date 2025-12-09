import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchBattlePair, submitVote } from '../lib/api';

export default function Battle() {
  const { id } = useParams();
  const [pair, setPair] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPair = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchBattlePair(id);
      setPair(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPair();
  }, [id]);

  const handleVote = async (winnerId: string, loserId: string) => {
    if (!id) return;
    try {
      await submitVote(id, winnerId, loserId);
      loadPair();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
        {pair.map((item) => (
          <button
            key={item.id}
            onClick={() => handleVote(item.id, pair.find((i) => i.id !== item.id)!.id)}
            className="p-8 border rounded-lg hover:shadow-lg transition"
          >
            <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover mb-4" />
            <h2 className="text-2xl font-semibold">{item.name}</h2>
            <p className="text-sm text-muted-foreground">ELO: {item.elo_score}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
