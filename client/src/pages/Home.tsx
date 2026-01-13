import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HomeFeed from "../components/home-feed";
import { NeoButton } from "../components/neo-button";
import { fetchTopics } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { normalizeTopic } from "../lib/topics";
import { Skeleton } from "../components/ui/skeleton";

export default function Home() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const filterMode = searchParams.get("mode") || "A"; // Default to 배틀형

  useEffect(() => {
    let cancelled = false;

    fetchTopics()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setTopics(res.data.map(normalizeTopic));
        } else {
          setError("토픽을 불러오지 못했습니다.");
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto pt-6 pb-10 space-y-6 px-4 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl">오늘의 랭킹 피드</h1>
            </div>
          </div>

          <div className="pb-20 px-1 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-full">
                  <div className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                    <Skeleton className="h-60 w-full rounded-none" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-2xl">오류가 발생했습니다</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a href="/api/seed/all" target="_blank" rel="noopener noreferrer">
            <NeoButton>데이터 다시 채우기</NeoButton>
          </a>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="font-heading text-2xl">콘텐츠가 아직 없어요</h1>
          <p className="text-sm text-muted-foreground">
            관리자 페이지에서 기본 데이터를 채워주세요.
          </p>
          <a href="/api/seed/all" target="_blank" rel="noopener noreferrer">
            <NeoButton className="mt-2">기본 시드 실행</NeoButton>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto pt-6 pb-10 space-y-6 px-4 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-lg md:text-xl ">오늘의 랭킹 피드</h1>
          </div>
        </div>

        <HomeFeed topics={topics} filterMode={filterMode} />
      </main>
    </div>
  );
}
