"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteAction(winnerId: string, loserId: string) {
  const supabase = await createClient();

  // 1. Fetch current scores
  const { data: items, error } = await supabase
    .from("ranking_items")
    .select("id, elo_score, win_count, loss_count, match_count")
    .in("id", [winnerId, loserId]);

  if (error || !items || items.length !== 2) {
    console.error("Error fetching items for vote:", error);
    return { success: false, error: "Failed to fetch items" };
  }

  const winner = items.find((i) => i.id === winnerId);
  const loser = items.find((i) => i.id === loserId);

  if (!winner || !loser) return { success: false, error: "Items not found" };

  // 2. Calculate new ELO (K-Factor = 32)
  const K = 32;
  const expectedWinner = 1 / (1 + 10 ** ((loser.elo_score - winner.elo_score) / 400));
  const expectedLoser = 1 / (1 + 10 ** ((winner.elo_score - loser.elo_score) / 400));

  const newWinnerScore = Math.round(winner.elo_score + K * (1 - expectedWinner));
  const newLoserScore = Math.round(loser.elo_score + K * (0 - expectedLoser));

  // 3. Update Winner
  const { error: winnerError } = await supabase
    .from("ranking_items")
    .update({
      elo_score: newWinnerScore,
      win_count: winner.win_count + 1,
      match_count: winner.match_count + 1,
    })
    .eq("id", winnerId);

  // 4. Update Loser
  const { error: loserError } = await supabase
    .from("ranking_items")
    .update({
      elo_score: newLoserScore,
      loss_count: loser.loss_count + 1,
      match_count: loser.match_count + 1,
    })
    .eq("id", loserId);

  if (winnerError || loserError) {
    console.error("Error updating scores:", winnerError, loserError);
    return { success: false, error: "Failed to update scores" };
  }

  revalidatePath("/battle/[id]");
  revalidatePath("/ranking/[id]");
  revalidatePath("/"); // Update home page rankings too

  return { success: true };
}

export async function postCommentAction(topicId: string, content: string) {
  const supabase = await createClient();
  
  // Generate random nickname for now (or use a library)
  const adjectives = ["Angry", "Happy", "Sad", "Crazy", "Lazy", "Fast", "Slow"];
  const nouns = ["Cat", "Dog", "Bird", "Fish", "Bear", "Lion", "Tiger"];
  const nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

  const { error } = await supabase.from("comments").insert({
    topic_id: topicId,
    nickname,
    content,
  });

  if (error) {
    console.error("Error posting comment:", error);
    return { success: false, error: "Failed to post comment" };
  }

  revalidatePath(`/battle/${topicId}`);
  revalidatePath(`/ranking/${topicId}`);
  return { success: true };
}

export async function createTopicAction(title: string, category: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.from("ranking_topics").insert({
    title,
    category,
    view_type: "BATTLE",
  }).select().single();

  if (error) {
    console.error("Error creating topic:", error);
    return { success: false, error: "Failed to create topic" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, topic: data };
}

export async function createItemAction(topicId: string, name: string, imageUrl: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("ranking_items").insert({
    topic_id: topicId,
    name,
    image_url: imageUrl,
    elo_score: 1200,
  });

  if (error) {
    console.error("Error creating item:", error);
    return { success: false, error: "Failed to create item" };
  }

  revalidatePath(`/battle/${topicId}`);
  revalidatePath(`/ranking/${topicId}`);
  revalidatePath("/admin");
  return { success: true };
}
