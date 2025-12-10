import { useCallback, useEffect, useState } from 'react';
import { fetchTopic } from '../lib/api';
import { normalizeTopic } from '../lib/topics';
import type { RankingTopic } from '../lib/types';

export function useTopic(topicId?: string) {
  const [topic, setTopic] = useState<RankingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTopic(id);
      if (res.success) {
        setTopic(normalizeTopic(res.data));
        return;
      }
      setError('토픽을 불러오지 못했습니다.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(topicId);
  }, [load, topicId]);

  return { topic, loading, error, reload: () => load(topicId) };
}
