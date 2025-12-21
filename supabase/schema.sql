-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Ranking Topics
create table if not exists ranking_topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text, -- 'Food', 'Work', 'Tech', etc.
  mode text default 'A', -- A: Battle, B: Test, C: Tier, D: Fact/List
  view_type text default 'BATTLE',
  meta jsonb default '{}'::jsonb,
  display_order int,
  created_at timestamptz default now()
);

alter table ranking_topics add column if not exists mode text default 'A';
alter table ranking_topics add column if not exists meta jsonb default '{}'::jsonb;
alter table ranking_topics add column if not exists display_order int;

-- 2. Ranking Items (Candidates)
create table if not exists ranking_items (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  name text not null,
  image_url text,
  description text,
  external_url text,
  youtube_url text,
  meta jsonb default '{}'::jsonb,
  rank_order int default 0,
  elo_score int default 1200,
  win_count int default 0,
  loss_count int default 0,
  match_count int default 0,
  created_at timestamptz default now()
);

alter table ranking_items add column if not exists description text;
alter table ranking_items add column if not exists external_url text;
alter table ranking_items add column if not exists youtube_url text;
alter table ranking_items add column if not exists meta jsonb default '{}'::jsonb;
alter table ranking_items add column if not exists rank_order int default 0;

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

-- Quiz submissions (Type B)
create table if not exists quiz_submissions (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  score numeric,
  percentile numeric,
  detail jsonb,
  created_at timestamptz default now()
);

-- Tier placements (Type C)
create table if not exists tier_placements (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  item_id uuid references ranking_items(id) on delete cascade,
  tier text check (tier in ('S','A','B','C','F')),
  session_id text,
  created_at timestamptz default now()
);

-- Quiz questions (Type B)
create table if not exists quiz_questions (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  prompt text not null,
  choices jsonb,
  answer text,
  weight numeric default 1,
  question_type text check (question_type in ('OX','MCQ')) default 'OX',
  created_at timestamptz default now()
);

-- Topic blog content (Fact / long form)
create table if not exists topic_posts (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  body_md text,
  body_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint topic_posts_topic_unique unique(topic_id)
);

alter table topic_posts enable row level security;

-- Game scores (simple leaderboard)
create table if not exists game_scores (
  id uuid default gen_random_uuid() primary key,
  game_id text not null,
  user_id text,
  session_id text,
  score numeric not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table game_scores enable row level security;

-- Topic likes
create table if not exists topic_likes (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references ranking_topics(id) on delete cascade,
  user_id text,
  session_id text not null,
  created_at timestamptz default now(),
  unique(topic_id, session_id)
);

alter table topic_likes enable row level security;

-- Add like_count to ranking_topics
alter table ranking_topics add column if not exists like_count int default 0;

-- Create policies (Public Read/Write for demo; tighten for prod). Guard with existence checks to make re-runs idempotent.
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read topics' and tablename = 'ranking_topics') then
    create policy "Public read topics" on ranking_topics for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read items' and tablename = 'ranking_items') then
    create policy "Public read items" on ranking_items for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read comments' and tablename = 'comments') then
    create policy "Public read comments" on comments for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read quiz submissions' and tablename = 'quiz_submissions') then
    create policy "Public read quiz submissions" on quiz_submissions for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read tier placements' and tablename = 'tier_placements') then
    create policy "Public read tier placements" on tier_placements for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read quiz questions' and tablename = 'quiz_questions') then
    create policy "Public read quiz questions" on quiz_questions for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read topic posts' and tablename = 'topic_posts') then
    create policy "Public read topic posts" on topic_posts for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read game scores' and tablename = 'game_scores') then
    create policy "Public read game scores" on game_scores for select using (true);
  end if;
end $$;

-- Insert policies
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert comments' and tablename = 'comments') then
    create policy "Public insert comments" on comments for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert quiz submissions' and tablename = 'quiz_submissions') then
    create policy "Public insert quiz submissions" on quiz_submissions for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert tier placements' and tablename = 'tier_placements') then
    create policy "Public insert tier placements" on tier_placements for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert quiz questions' and tablename = 'quiz_questions') then
    create policy "Public insert quiz questions" on quiz_questions for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert topic posts' and tablename = 'topic_posts') then
    create policy "Public insert topic posts" on topic_posts for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public update topic posts' and tablename = 'topic_posts') then
    create policy "Public update topic posts" on topic_posts for update using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert game scores' and tablename = 'game_scores') then
    create policy "Public insert game scores" on game_scores for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public read topic likes' and tablename = 'topic_likes') then
    create policy "Public read topic likes" on topic_likes for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert topic likes' and tablename = 'topic_likes') then
    create policy "Public insert topic likes" on topic_likes for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public delete topic likes' and tablename = 'topic_likes') then
    create policy "Public delete topic likes" on topic_likes for delete using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public update topics' and tablename = 'ranking_topics') then
    create policy "Public update topics" on ranking_topics for update using (true);
  end if;
end $$;

-- Update items (voting)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public update items' and tablename = 'ranking_items') then
    create policy "Public update items" on ranking_items for update using (true);
  end if;
end $$;

-- Insert topics/items (seeding/admin)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert topics' and tablename = 'ranking_topics') then
    create policy "Public insert topics" on ranking_topics for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public insert items' and tablename = 'ranking_items') then
    create policy "Public insert items" on ranking_items for insert with check (true);
  end if;
end $$;
