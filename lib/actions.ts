"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type TopicMode } from "@/lib/types";

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

const modeToViewType: Record<TopicMode, "BATTLE" | "FACT" | "HELL" | "TEST" | "TIER"> = {
  A: "BATTLE",
  B: "TEST",
  C: "TIER",
  D: "FACT",
};

export async function createTopicAction(title: string, category: string, mode: TopicMode = "A") {
  const supabase = await createClient();
  
  const { data, error } = await supabase.from("ranking_topics").insert({
    title,
    category,
    mode,
    view_type: modeToViewType[mode],
  }).select().single();

  if (error) {
    console.error("Error creating topic:", error);
    return { success: false, error: "Failed to create topic" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, topic: data };
}

export async function createItemAction(
  topicId: string,
  name: string,
  imageUrl: string,
  description?: string,
  rankOrder?: number
) {
  const supabase = await createClient();

  const { error } = await supabase.from("ranking_items").insert({
    topic_id: topicId,
    name,
    image_url: imageUrl,
    description,
    rank_order: rankOrder ?? 0,
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

export async function updateItemAction(
  itemId: string,
  name: string,
  imageUrl: string,
  description?: string,
  rankOrder?: number
) {
  // Use admin client to bypass RLS if service role key is available
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("ranking_items")
    .update({
      name,
      image_url: imageUrl,
      description,
      rank_order: rankOrder ?? 0,
    })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating item:", error);
    return { success: false, error: "Failed to update item" };
  }

  // We need to know the topic_id to revalidate properly, but for now we can revalidate broadly or fetch it first.
  // Fetching topic_id is safer.
  const { data: item } = await supabase.from("ranking_items").select("topic_id").eq("id", itemId).single();
  
  if (item) {
    revalidatePath(`/battle/${item.topic_id}`);
    revalidatePath(`/ranking/${item.topic_id}`);
  }
  revalidatePath("/admin");
  
  return { success: true };
}

export async function deleteItemAction(itemId: string) {
  console.log("deleteItemAction called for:", itemId);
  // Use admin client to bypass RLS if service role key is available
  const supabase = await createAdminClient();

  // Get topic_id before deleting for revalidation
  const { data: item, error: fetchError } = await supabase.from("ranking_items").select("topic_id").eq("id", itemId).single();
  
  if (fetchError) {
    console.log("Error fetching item before delete:", fetchError);
  } else {
    console.log("Item found before delete:", item);
  }

  const { error, count } = await supabase.from("ranking_items").delete({ count: "exact" }).eq("id", itemId);

  console.log("Delete count:", count);

  if (error) {
    console.error("Error deleting item:", error);
    return { success: false, error: "Failed to delete item: " + error.message };
  }

  if (count === 0) {
    console.warn("No items deleted. Possible RLS issue or item not found.");
    // Check if we are using the service role key
    const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!isServiceRole) {
      return { 
        success: false, 
        error: "Deletion failed. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file to enable admin deletion." 
      };
    }
    return { success: false, error: "Item not found or permission denied (RLS)." };
  }

  if (item) {
    revalidatePath(`/battle/${item.topic_id}`);
    revalidatePath(`/ranking/${item.topic_id}`);
  }
  revalidatePath("/admin");

  return { success: true };
}

export async function updateItemOrdersAction(
  topicId: string,
  orders: { itemId: string; rankOrder: number }[]
) {
  const supabase = await createAdminClient();

  try {
    await Promise.all(
      orders.map((order) =>
        supabase
          .from("ranking_items")
          .update({ rank_order: order.rankOrder })
          .eq("id", order.itemId)
      )
    );
  } catch (error) {
    console.error("Error updating rank order:", error);
    return { success: false, error: "순위 저장 실패" };
  }

  revalidatePath(`/fact/${topicId}`);
  revalidatePath("/admin");
  return { success: true };
}

import { generateTopicContent, generateImage } from "@/lib/ai";

export async function generateTopicWithAIAction(prompt: string, mode: TopicMode = "A") {
  const supabase = await createClient();

  try {
    // 1. Generate Content
    const content = await generateTopicContent(prompt);

    // 2. Create Topic
    const { data: topic, error: topicError } = await supabase.from("ranking_topics").insert({
      title: content.title,
      category: content.category,
      mode,
      view_type: modeToViewType[mode],
    }).select().single();

    if (topicError || !topic) {
      throw new Error("Failed to create topic: " + topicError?.message);
    }

    // 3. Generate Images and Create Items (Parallel)
    // We limit concurrency to avoid hitting rate limits if necessary, but Promise.all is fine for 8 items usually.
    const itemPromises = content.items.map(async (itemName) => {
      let imageUrl = "https://placehold.co/400x400?text=" + encodeURIComponent(itemName);
      try {
        // Try to generate image
        // The generateImage function in lib/ai.ts handles the API key check
        imageUrl = await generateImage(itemName);
      } catch (e) {
        console.error(`Failed to generate image for ${itemName}:`, e);
      }

      return {
        topic_id: topic.id,
        name: itemName,
        image_url: imageUrl,
        elo_score: 1200,
      };
    });

    const itemsToInsert = await Promise.all(itemPromises);

    const { error: itemsError } = await supabase.from("ranking_items").insert(itemsToInsert);

    if (itemsError) {
      throw new Error("Failed to create items: " + itemsError.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, topicId: topic.id };

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return { success: false, error: error.message };
  }
}

export async function submitQuizAction(
  topicId: string,
  score: number,
  detail?: Record<string, unknown>
) {
  const supabase = await createClient();
  let percentile = Math.max(0, Math.min(100, Math.round(score)));

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("quiz_submissions")
      .select("score")
      .eq("topic_id", topicId);

    if (fetchError) {
      console.error("quiz_submissions fetch error:", fetchError);
    }

    if (existing && existing.length > 0) {
      const lowerOrEqual = existing.filter((row) => Number(row.score) <= score).length + 1;
      percentile = Math.round((lowerOrEqual / (existing.length + 1)) * 100);
    } else {
      percentile = 100;
    }

    const { error: insertError } = await supabase.from("quiz_submissions").insert({
      topic_id: topicId,
      score,
      percentile,
      detail: detail || {},
    });

    if (insertError) {
      console.error("quiz_submissions insert error:", insertError);
    }
  } catch (error) {
    console.error("Error recording quiz submission:", error);
  }

  revalidatePath(`/test/${topicId}`);
  return { success: true, percentile };
}

export async function saveTierPlacementsAction(
  topicId: string,
  placements: { itemId: string; tier: "S" | "A" | "B" | "C" | "F" }[],
  sessionId?: string
) {
  const supabase = await createClient();
  const session = sessionId || "anon";

  try {
    const { error: deleteError } = await supabase
      .from("tier_placements")
      .delete()
      .eq("topic_id", topicId)
      .eq("session_id", session);

    if (deleteError) {
      console.error("tier_placements delete error:", deleteError);
    }

    if (placements.length > 0) {
      const { error: insertError } = await supabase.from("tier_placements").insert(
        placements.map((placement) => ({
          topic_id: topicId,
          item_id: placement.itemId,
          tier: placement.tier,
          session_id: session,
        }))
      );

      if (insertError) {
        console.error("tier_placements insert error:", insertError);
        return { success: false, error: "티어 저장 실패" };
      }
    }
  } catch (error) {
    console.error("Error saving tier placements:", error);
    return { success: false, error: "티어 저장 실패" };
  }

  revalidatePath(`/tier/${topicId}`);
  return { success: true };
}

export async function saveTopicContentAction(
  topicId: string,
  bodyMarkdown: string,
  bodyJson?: Record<string, unknown> | null
) {
  const supabase = await createAdminClient();
  try {
    const { error } = await supabase
      .from("topic_posts")
      .upsert(
        {
          topic_id: topicId,
          body_md: bodyMarkdown,
          body_json: bodyJson ?? null,
        },
        { onConflict: "topic_id" }
      );

    if (error) {
      console.error("Error upserting topic_posts:", error);
      return { success: false, error: "저장 실패" };
    }
  } catch (e) {
    console.error("Unexpected error saving topic content:", e);
    return { success: false, error: "저장 실패" };
  }

  revalidatePath(`/fact/${topicId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function submitGameScoreAction(
  gameId: string,
  score: number,
  sessionId?: string,
  userId?: string,
  meta?: Record<string, unknown>
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("game_scores").insert({
      game_id: gameId,
      session_id: sessionId || "anon",
      user_id: userId || null,
      score,
      meta: meta || {},
    });

    if (error) {
      console.error("submitGameScoreAction insert error:", error);
      return { success: false, error: "점수 저장 실패" };
    }
  } catch (e) {
    console.error("submitGameScoreAction unexpected error:", e);
    return { success: false, error: "점수 저장 실패" };
  }

  revalidatePath(`/games/${gameId}`);
  return { success: true };
}
