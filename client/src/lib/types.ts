export type TopicMode = 'A' | 'B' | 'C' | 'D';

export interface RankingItem {
  id: string;
  topicId?: string;
  topic_id?: string;
  name: string;
  imageUrl?: string;
  image_url?: string;
  description?: string;
  externalUrl?: string;
  meta?: Record<string, unknown>;
  rankOrder?: number;
  eloScore?: number;
  elo_score?: number;
  winCount?: number;
  win_count?: number;
  lossCount?: number;
  loss_count?: number;
  matchCount?: number;
  match_count?: number;
  rank?: number;
  change?: number;
}

export interface RankingTopic {
  id: string;
  title: string;
  category: string;
  viewType?: 'BATTLE' | 'FACT' | 'HELL' | 'TEST' | 'TIER';
  view_type?: 'battle' | 'fact' | 'hell' | 'test' | 'tier';
  mode: TopicMode | string;
  meta?: Record<string, unknown>;
  contentMarkdown?: string;
  contentJson?: Record<string, unknown>;
  createdAt?: string;
  created_at?: string;
  items: RankingItem[];
}

export interface Comment {
  id: string;
  topic_id: string;
  nickname: string;
  content: string;
  created_at: string;
}
