import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/header';
import HomeFeed from '../components/home-feed';
import { NeoButton } from '../components/neo-button';
import { fetchTopics } from '../lib/api';

// Convert snake_case to camelCase for items
function normalizeTopicData(topics: any[]) {
  return topics.map(topic => ({
    ...topic,
    createdAt: topic.created_at || topic.createdAt,
    items: topic.items.map((item: any) => ({
      ...item,
      imageUrl: item.image_url || item.imageUrl,
      eloScore: item.elo_score || item.eloScore || 1000,
      matchCount: item.match_count || item.matchCount || 0,
      winCount: item.win_count || item.winCount || 0,
      lossCount: item.loss_count || item.lossCount || 0,
    }))
  }));
}

export default function Home() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const filterMode = searchParams.get('mode') || 'A'; // Default to 배틀형

  useEffect(() => {
    fetchTopics()
      .then((res) => {
        if (res.success && res.data) {
          setTopics(normalizeTopicData(res.data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>로딩 중...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="font-heading text-4xl mb-4">오류가 발생했습니다</h1>
          <p className="mb-4">{error}</p>
          <Link to="/api/seed">
            <NeoButton>데이터 시딩하기</NeoButton>
          </Link>
        </main>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="font-heading text-4xl mb-4">데이터가 없습니다</h1>
          <p className="mb-4">관리자에게 문의하거나 시딩을 진행해주세요.</p>
          <a href="/api/seed" target="_blank" rel="noopener noreferrer">
            <NeoButton className="mt-4">데이터 시딩하기</NeoButton>
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Header />
      </div>
      <main className="pt-3 md:pt-8">
        <HomeFeed topics={topics} filterMode={filterMode} />
      </main>
    </div>
  );
}
