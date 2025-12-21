import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { submitVote } from '../lib/api';
import { normalizeItem } from '../lib/topics';
import { useTopic } from '../hooks/useTopic';
import { NeoButton } from '../components/neo-button';
import { NeoCard } from '../components/neo-card';
import { useAuth } from '../hooks/useAuth';
import type { RankingItem } from '../lib/types';
import Comments from '../components/comments';
import { ShareButton } from '../components/share-button';
import { YouTubePlayer } from '../components/youtube-player';

export default function Battle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { topic, loading: topicLoading, error } = useTopic(id);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const locked = !user;
  const [currentRound, setCurrentRound] = useState<RankingItem[]>([]);
  const [nextRound, setNextRound] = useState<RankingItem[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [placements, setPlacements] = useState<RankingItem[]>([]);
  const [champion, setChampion] = useState<RankingItem | null>(null);
  const [done, setDone] = useState(false);
  const [stageSize, setStageSize] = useState(0);

  const currentPair = useMemo(() => currentRound.slice(0, 2), [currentRound]);
  const bracketLabel = useMemo(() => {
    if (stageSize <= 2) return '결승';
    return `${stageSize}강`;
  }, [stageSize]);
  const stageMatches = Math.max(1, Math.ceil(stageSize / 2));
  const currentMatch = Math.min(
    stageMatches,
    Math.max(1, Math.floor((stageSize - currentRound.length) / 2) + 1),
  );

  useEffect(() => {
    if (!topic) return;
    const shuffled = [...topic.items].map(normalizeItem).sort(() => Math.random() - 0.5);
    setCurrentRound(shuffled);
    setNextRound([]);
    setRoundNumber(1);
    setStageSize(shuffled.length);
    setPlacements([]);
    setChampion(null);
    setDone(false);
  }, [topic]);

  useEffect(() => {
    if (done) return;
    // 홀수 인원일 때 마지막 한 명을 자동 진출
    if (currentRound.length > 1 && currentRound.length % 2 === 1) {
      setNextRound((prev) => [...prev, currentRound[currentRound.length - 1]]);
      setCurrentRound((prev) => prev.slice(0, -1));
      return;
    }

    if (currentRound.length === 1) {
      setNextRound((prev) => [...prev, currentRound[0]]);
      setCurrentRound([]);
      return;
    }

    if (currentRound.length === 0 && nextRound.length > 0) {
      if (nextRound.length === 1) {
        setChampion(nextRound[0]);
        setDone(true);
        setNextRound([]);
      } else {
        setStageSize(nextRound.length);
        setCurrentRound(nextRound);
        setNextRound([]);
        setRoundNumber((r) => r + 1);
      }
    }
  }, [currentRound, nextRound, done]);

  const progressBracket = (winner: RankingItem, loser?: RankingItem) => {
    if (loser) {
      setPlacements((prev) => [loser, ...prev]);
    }

    const updatedCurrent = currentRound.slice(2);
    const updatedNext = [...nextRound, winner];

    if (updatedCurrent.length === 0) {
      if (updatedNext.length === 1) {
        setChampion(updatedNext[0]);
        setDone(true);
        setCurrentRound([]);
        setNextRound([]);
      } else {
        setStageSize(updatedNext.length);
        setCurrentRound(updatedNext);
        setNextRound([]);
        setRoundNumber((r) => r + 1);
      }
    } else {
      setCurrentRound(updatedCurrent);
      setNextRound(updatedNext);
    }
  };

  const handleVote = async (winnerId: string) => {
    if (locked || !id || currentPair.length < 2) return;
    const winner = currentPair.find((i) => i.id === winnerId);
    const loser = currentPair.find((i) => i.id !== winnerId);
    if (!winner || !loser) return;

    setSubmitting(true);
    try {
      await submitVote(id, winnerId, loser.id);
      progressBracket(winner, loser);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (topicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">매치업 준비 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 px-4">
        <p className="text-sm text-muted-foreground">토픽을 불러오지 못했습니다.</p>
        <NeoButton variant="outline" onClick={() => navigate('/')}>
          홈으로
        </NeoButton>
      </div>
    );
  }

  if (done && champion) {
    const ranking = [champion, ...placements];
    return (
      <div className="min-h-screen bg-background px-3 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase">{topic.category}</p>
            <h1 className="font-heading text-2xl">토너먼트 결과</h1>
          </div>
          <div className="flex items-center gap-2">
            <NeoButton variant="outline" size="sm" onClick={() => navigate('/')}>
              돌아가기
            </NeoButton>
            <NeoButton
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="font-fixel"
            >
              🔄 다시하기
            </NeoButton>
            <ShareButton
              compact
              showLabel
              title={topic.title}
              text={`토너먼트 결과 - 우승: ${champion.name}`}
            />
          </div>
        </div>
        <NeoCard className="p-4 space-y-3">
          {ranking.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="font-heading text-xl w-10 text-center">#{idx + 1}</div>
              <div className="w-14 h-14 border-2 border-black overflow-hidden bg-muted">
                <img src={item.imageUrl || item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-heading text-lg">{item.name}</div>
                <div className="text-xs text-muted-foreground">ELO {item.eloScore}</div>
              </div>
            </div>
          ))}
        </NeoCard>

        <div className="max-w-3xl">
          <Comments topicId={topic.id} />
        </div>
      </div>
    );
  }

  const displayPair = currentPair.length === 2 ? currentPair : [];

  return (
    <div className="w-screen h-screen bg-black text-white overflow-hidden">
      <div className="absolute top-2 left-2 z-20 space-y-1">
        <div className="text-xs uppercase text-white/70">{topic.category}</div>
        <div className="font-heading text-lg">{topic.title}</div>
        <div className="text-xs text-white/70">
          {bracketLabel} · {currentMatch}/{stageMatches} 라운드
        </div>
      </div>

      {locked && (
        <div className="absolute top-2 right-2 z-20">
          <NeoButton size="sm" variant="secondary" onClick={() => navigate('/login')}>
            로그인 후 참여
          </NeoButton>
        </div>
      )}

      {displayPair.length === 2 ? (
        <div className="w-full h-full flex">
          {displayPair.map((item, idx) => {
            const youtubeUrl = item.youtubeUrl || item.youtube_url;
            const imageUrl = item.imageUrl || item.image_url;
            const hasYouTube = !!youtubeUrl;

            return (
              <div key={item.id} className="relative flex-1 overflow-hidden">
                {hasYouTube ? (
                  <div className="absolute inset-0 w-full h-full">
                    <YouTubePlayer url={youtubeUrl} fullHeight />
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* 정보 및 선택 버튼 */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                  <div className="text-sm text-white/70 mb-2">Player {idx + 1}</div>
                  <div className="font-heading text-3xl text-white mb-4">{item.name}</div>

                  <button
                    onClick={() => handleVote(item.id)}
                    disabled={submitting || locked}
                    className="pointer-events-auto w-full bg-white text-black font-heading text-xl py-4 px-6 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    선택하기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/70 text-sm">
          매치업 준비 중...
        </div>
      )}
    </div>
  );
}
