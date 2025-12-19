/**
 * This file has been deprecated in favor of the new seed script system.
 *
 * To seed data, use the new CLI script:
 *   bun run seed <path-to-json>
 *
 * See scripts/seed/README.md for documentation.
 *
 * This file is kept for reference only and should not be used.
 */

// Types kept for backward compatibility
export type SeedItem = {
  name: string;
  image_url: string;
  description?: string;
  rank_order?: number;
  meta?: Record<string, unknown>;
  elo_score?: number;
  win_count?: number;
  loss_count?: number;
  match_count?: number;
};

export type SeedTopic = {
  title: string;
  category: string;
  mode: 'A' | 'B' | 'C' | 'D';
  view_type: 'battle' | 'test' | 'tier' | 'fact';
  meta?: Record<string, unknown>;
  items: SeedItem[];
};
