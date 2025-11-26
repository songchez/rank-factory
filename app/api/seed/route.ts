import { createClient } from "@/lib/supabase/server";
import { mockTopics } from "@/lib/mock-data";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    // 1. Clear existing data (optional, be careful in prod)
    // await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    // await supabase.from("ranking_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    // await supabase.from("ranking_topics").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const results = [];

    for (const topic of mockTopics) {
      // Insert Topic
      const { data: topicData, error: topicError } = await supabase
        .from("ranking_topics")
        .insert({
          title: topic.title,
          category: topic.category,
          view_type: topic.viewType,
          created_at: topic.createdAt,
        })
        .select()
        .single();

      if (topicError) {
        console.error("Error inserting topic:", topic.title, topicError);
        continue;
      }

      results.push({ topic: topic.title, status: "inserted" });

      // Insert Items
      const itemsToInsert = topic.items.map((item) => ({
        topic_id: topicData.id,
        name: item.name,
        image_url: item.imageUrl,
        elo_score: item.eloScore,
        win_count: item.winCount,
        loss_count: item.lossCount,
        match_count: item.matchCount,
      }));

      const { error: itemsError } = await supabase
        .from("ranking_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Error inserting items for topic:", topic.title, itemsError);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
