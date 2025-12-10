import type { RankingTopic, RankingItem } from './types';

export type TopicMode = 'A' | 'B' | 'C' | 'D';

export function resolveMode(topic: Pick<RankingTopic, 'mode' | 'view_type'>): TopicMode {
  if (topic.mode) return topic.mode as TopicMode;
  if (topic.view_type === 'fact') return 'D';
  if (topic.view_type === 'test') return 'B';
  if (topic.view_type === 'tier') return 'C';
  return 'A';
}

export function getModePlayPath(topic: Pick<RankingTopic, 'id' | 'mode' | 'view_type'>) {
  const mode = resolveMode(topic);
  switch (mode) {
    case 'B':
      return `/test/${topic.id}`;
    case 'C':
      return `/tier/${topic.id}`;
    case 'D':
      return `/fact/${topic.id}`;
    case 'A':
    default:
      return `/battle/${topic.id}`;
  }
}

export function getModeResultPath(topic: Pick<RankingTopic, 'id' | 'mode' | 'view_type'>) {
  const mode = resolveMode(topic);
  if (mode === 'A') return `/ranking/${topic.id}`;
  return getModePlayPath(topic);
}

export function getModeLabel(mode: TopicMode) {
  switch (mode) {
    case 'A':
      return '배틀';
    case 'B':
      return '테스트';
    case 'C':
      return '티어';
    case 'D':
      return '팩트';
    default:
      return '배틀';
  }
}

export function normalizeItem(raw: any): RankingItem {
  return {
    ...raw,
    topicId: raw.topicId ?? raw.topic_id,
    topic_id: raw.topic_id ?? raw.topicId,
    imageUrl: raw.image_url ?? raw.imageUrl,
    image_url: raw.image_url ?? raw.imageUrl,
    externalUrl: raw.external_url ?? raw.externalUrl,
    rankOrder: raw.rankOrder ?? raw.rank_order ?? 0,
    eloScore: raw.elo_score ?? raw.eloScore ?? 1200,
    winCount: raw.win_count ?? raw.winCount ?? 0,
    lossCount: raw.loss_count ?? raw.lossCount ?? 0,
    matchCount: raw.match_count ?? raw.matchCount ?? 0,
    meta: raw.meta ?? {},
  };
}

export function normalizeTopic(raw: any): RankingTopic {
  return {
    ...raw,
    view_type: raw.view_type ?? raw.viewType ?? 'battle',
    mode: raw.mode ?? resolveMode(raw as RankingTopic),
    createdAt: raw.created_at ?? raw.createdAt,
    created_at: raw.created_at ?? raw.createdAt,
    items: (raw.items || []).map(normalizeItem),
  };
}
