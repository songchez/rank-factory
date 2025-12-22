/**
 * Type definitions for seed system
 */

export type SeedMode = "A" | "B" | "C" | "D";
export type ViewType = "battle" | "test" | "tier" | "fact";

export interface SeedItem {
  name: string;
  image_url: string;
  youtube_url: string;
  description?: string;
  rank_order?: number;
  meta?: Record<string, unknown>;
  elo_score?: number;
  win_count?: number;
  loss_count?: number;
  match_count?: number;
}

export interface QuizChoice {
  text: string;
  weight: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  image_url?: string;
  choices: QuizChoice[];
}

export interface QuizResult {
  threshold: number;
  label: string;
  summary: string;
  image_url: string;
  description: string;
}

export interface SeedTopicMeta {
  description?: string;
  questions?: QuizQuestion[];
  results?: QuizResult[];
  tiers?: string[];
  source?: string;
  lastSyncedAt?: string;
  body?: string;
  [key: string]: unknown;
}

export interface SeedTopic {
  title: string;
  category: string;
  mode: SeedMode;
  view_type: ViewType;
  meta?: SeedTopicMeta;
  items: SeedItem[];
}

export interface SeedConfig {
  // File or directory path
  input: string;
  // Filter by mode
  mode?: SeedMode;
  // Upload local images to Supabase Storage
  uploadImages?: boolean;
  // Dry run (validate only, don't insert)
  dryRun?: boolean;
  // Verbose logging
  verbose?: boolean;
}

export interface SeedResult {
  success: boolean;
  topicId?: string;
  topicTitle: string;
  itemCount: number;
  status: "created" | "updated" | "skipped" | "error";
  error?: string;
  uploadedImages?: string[];
}
