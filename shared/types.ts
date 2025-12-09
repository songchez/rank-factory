// Database Types
export interface RankingTopic {
  id: string;
  title: string;
  category: string;
  mode: string;
  view_type: string;
  created_at: string;
}

export interface RankingItem {
  id: string;
  topic_id: string;
  name: string;
  image_url: string;
  elo_score: number;
  win_count: number;
  loss_count: number;
  match_count: number;
}

export interface Comment {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// API Types
export interface GeneratedTopic {
  title: string;
  category: string;
  items: string[];
}

export interface VoteResult {
  winnerId: string;
  loserId: string;
  topicId: string;
}

// Category Types
export type Category = 'General' | 'Food' | 'Tech' | 'Game' | 'Entertain';

// Mode Types
export type RankingMode = 'A' | 'B' | 'C' | 'D';
export type ViewType = 'battle' | 'tier' | 'fact' | 'test';
