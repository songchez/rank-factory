import { createClient } from "@/lib/supabase/server";
import { RankingTopic, RankingItem, Comment } from "./types";

export async function getTopics(page = 1, limit = 10): Promise<{ topics: RankingTopic[], total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: topics, error, count } = await supabase
    .from("ranking_topics")
    .select("*, items:ranking_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching topics:", error);
    return { topics: [], total: 0 };
  }

  const formattedTopics = topics.map((topic: any) => ({
    id: topic.id,
    title: topic.title,
    category: topic.category,
    viewType: topic.view_type,
    createdAt: topic.created_at,
    items: topic.items.map((item: any) => ({
      id: item.id,
      topicId: item.topic_id,
      name: item.name,
      imageUrl: item.image_url,
      eloScore: item.elo_score,
      winCount: item.win_count,
      lossCount: item.loss_count,
      matchCount: item.match_count,
    })),
  }));

  return { topics: formattedTopics, total: count || 0 };
}

export async function getTopicItems(topicId: string, page = 1, limit = 20): Promise<{ items: RankingItem[], total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: items, error, count } = await supabase
    .from("ranking_items")
    .select("*", { count: "exact" })
    .eq("topic_id", topicId)
    .order("elo_score", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching items:", error);
    return { items: [], total: 0 };
  }

  const formattedItems = items.map((item: any) => ({
    id: item.id,
    topicId: item.topic_id,
    name: item.name,
    imageUrl: item.image_url,
    eloScore: item.elo_score,
    winCount: item.win_count,
    lossCount: item.loss_count,
    matchCount: item.match_count,
  }));

  return { items: formattedItems, total: count || 0 };
}

export async function getTopicById(id: string): Promise<RankingTopic | null> {
  const supabase = await createClient();
  const { data: topic, error } = await supabase
    .from("ranking_topics")
    .select("*, items:ranking_items(*)")
    .eq("id", id)
    .single();

  if (error || !topic) {
    console.error("Error fetching topic:", error);
    return null;
  }

  return {
    id: topic.id,
    title: topic.title,
    category: topic.category,
    viewType: topic.view_type,
    createdAt: topic.created_at,
    items: topic.items.map((item: any) => ({
      id: item.id,
      topicId: item.topic_id,
      name: item.name,
      imageUrl: item.image_url,
      eloScore: item.elo_score,
      winCount: item.win_count,
      lossCount: item.loss_count,
      matchCount: item.match_count,
    })),
  };
}

export async function getComments(topicId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return comments as Comment[];
}
