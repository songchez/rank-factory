-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Ranking Topics
create table if not exists ranking_topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text, -- 'Food', 'Work', 'Tech', etc.
  view_type text default 'BATTLE',
  created_at timestamptz default now()
);

-- 2. Ranking Items (Candidates)
create table if not exists ranking_items (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  name text not null,
  image_url text,
  elo_score int default 1200,
  win_count int default 0,
  loss_count int default 0,
  match_count int default 0,
  created_at timestamptz default now()
);

-- 3. Comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  nickname text not null,
  content text check (char_length(content) <= 100),
  ip_hash text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table ranking_topics enable row level security;
alter table ranking_items enable row level security;
alter table comments enable row level security;

-- Create policies (Public Read, Public Write for demo purposes - in prod, restrict write)
-- For this MVP, we allow public read/write to simplify interaction without auth
create policy "Public read topics" on ranking_topics for select using (true);
create policy "Public read items" on ranking_items for select using (true);
create policy "Public read comments" on comments for select using (true);

-- Allow inserting comments
create policy "Public insert comments" on comments for insert with check (true);

-- Allow updating items (for voting) - In a real app, use RPC for security
create policy "Public update items" on ranking_items for update using (true);

-- Allow inserting topics/items (for seeding/admin)
create policy "Public insert topics" on ranking_topics for insert with check (true);
create policy "Public insert items" on ranking_items for insert with check (true);
