export type TopicMode = "A" | "B" | "C" | "D";

export interface RankingItem {
  id: string;
  topicId: string;
  name: string;
  imageUrl: string;
  description?: string;
  externalUrl?: string;
  meta?: Record<string, unknown>;
  rankOrder?: number;
  eloScore: number;
  winCount: number;
  lossCount: number;
  matchCount: number;
  rank?: number;
  change?: number;
}

export interface RankingTopic {
  id: string;
  title: string;
  category: string;
  viewType: "BATTLE" | "FACT" | "HELL" | "TEST" | "TIER";
  mode: TopicMode;
  meta?: Record<string, unknown>;
  contentMarkdown?: string;
  contentJson?: Record<string, unknown>;
  createdAt: string;
  items: RankingItem[];
}

export interface Comment {
  id: string;
  topic_id: string;
  nickname: string;
  content: string;
  created_at: string;
}
