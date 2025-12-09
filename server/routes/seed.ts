import { Hono } from 'hono';
import { createAdminClient } from '../lib/supabase';

const seed = new Hono();

// Mock data - you can import from a separate file later
const mockTopics = [
  {
    title: "최고의 프로그래밍 언어",
    category: "Tech",
    mode: "A",
    viewType: "battle",
    createdAt: new Date().toISOString(),
    items: [
      { name: "JavaScript", imageUrl: "https://placehold.co/400x400?text=JS", eloScore: 1000, winCount: 0, lossCount: 0, matchCount: 0 },
      { name: "Python", imageUrl: "https://placehold.co/400x400?text=Python", eloScore: 1000, winCount: 0, lossCount: 0, matchCount: 0 },
      { name: "TypeScript", imageUrl: "https://placehold.co/400x400?text=TS", eloScore: 1000, winCount: 0, lossCount: 0, matchCount: 0 },
      { name: "Rust", imageUrl: "https://placehold.co/400x400?text=Rust", eloScore: 1000, winCount: 0, lossCount: 0, matchCount: 0 },
    ]
  }
];

seed.get('/', async (c) => {
  try {
    const supabase = createAdminClient(c.env);
    const results = [];

    for (const topic of mockTopics) {
      // Insert Topic
      const { data: topicData, error: topicError } = await supabase
        .from('ranking_topics')
        .insert({
          title: topic.title,
          category: topic.category,
          mode: topic.mode,
          view_type: topic.viewType,
          created_at: topic.createdAt,
        })
        .select()
        .single();

      if (topicError) {
        console.error('Error inserting topic:', topic.title, topicError);
        continue;
      }

      results.push({ topic: topic.title, status: 'inserted' });

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
        .from('ranking_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error inserting items for topic:', topic.title, itemsError);
      }
    }

    return c.json({ success: true, results });
  } catch (error) {
    return c.json(
      { success: false, error: (error as Error).message },
      500
    );
  }
});

export default seed;
