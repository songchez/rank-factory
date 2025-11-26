export interface RankingItem {
  id: string;
  topicId: string;
  name: string;
  imageUrl: string;
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
  viewType: "BATTLE" | "FACT" | "HELL";
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
