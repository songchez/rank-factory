import { Hono } from 'hono';
import { createClient, createAdminClient } from '../lib/supabase';
import { generateTopicContent, generateImage } from '../lib/ai';
import { ensureSeeded, buildOfflineSeed } from '../lib/seed';

function hasSupabaseEnv(env?: any) {
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const supabaseKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    env?.SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== 'undefined' && (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY));
  return !!(supabaseUrl && supabaseKey);
}

const topics = new Hono();

// Get all topics with items
topics.get('/', async (c) => {
  try {
    const seeded = await ensureSeeded(c.env);
    if (!hasSupabaseEnv(c.env) && seeded.offlineData) {
      return c.json({ success: true, data: seeded.offlineData });
    }

    const supabase = createClient(c);

    // Get all topics
    const { data: topicsData, error: topicsError } = await supabase
      .from('ranking_topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (topicsError) throw topicsError;

    // Get all items for these topics
    const { data: itemsData, error: itemsError } = await supabase
      .from('ranking_items')
      .select('*')
      .order('elo_score', { ascending: false });

    if (itemsError) throw itemsError;

    // Combine topics with their items
    const topicsWithItems = topicsData.map(topic => ({
      ...topic,
      items: itemsData.filter(item => item.topic_id === topic.id)
    }));

    return c.json({ success: true, data: topicsWithItems });
  } catch (error) {
    console.error('topics.get / error', error);
    return c.json({ success: true, data: buildOfflineSeed(), note: 'offline-seed' }, 200);
  }
});

// Get single topic with items
topics.get('/:id', async (c) => {
  try {
    const seeded = await ensureSeeded(c.env);
    if (!hasSupabaseEnv(c.env) && seeded.offlineData) {
      const found = seeded.offlineData.find((t) => t.id === c.req.param('id'));
      if (found) {
        return c.json({ success: true, data: found });
      }
      return c.json({ success: false, error: 'Topic not found' }, 404);
    }

    const id = c.req.param('id');
    const supabase = createClient(c);

    const { data: topic, error: topicError } = await supabase
      .from('ranking_topics')
      .select('*')
      .eq('id', id)
      .single();

    if (topicError) throw topicError;

    const { data: items, error: itemsError } = await supabase
      .from('ranking_items')
      .select('*')
      .eq('topic_id', id)
      .order('elo_score', { ascending: false });

    if (itemsError) throw itemsError;

    return c.json({ success: true, data: { ...topic, items } });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Create topic
topics.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const supabase = createAdminClient(c.env);

    const { data, error } = await supabase
      .from('ranking_topics')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Generate topic with AI
topics.post('/generate', async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt) {
      return c.json({ success: false, error: 'Prompt is required' }, 400);
    }

    // Generate topic content
    const generatedTopic: GeneratedTopic = await generateTopicContent(prompt, c.env);

    // Generate images for each item
    const itemsWithImages = await Promise.all(
      generatedTopic.items.map(async (itemName) => {
        const imageUrl = await generateImage(
          `A simple, clean icon representing: ${itemName}. Minimalist style, centered composition.`,
          c.env
        );
        return {
          name: itemName,
          image_url: imageUrl,
          elo_score: 1000,
          win_count: 0,
          loss_count: 0,
          match_count: 0,
        };
      })
    );

    // Create topic in database
    const supabase = createAdminClient(c.env);

    const { data: topicData, error: topicError } = await supabase
      .from('ranking_topics')
      .insert({
        title: generatedTopic.title,
        category: generatedTopic.category,
        mode: 'A',
        view_type: 'battle',
      })
      .select()
      .single();

    if (topicError) throw topicError;

    // Insert items
    const itemsToInsert = itemsWithImages.map((item) => ({
      ...item,
      topic_id: topicData.id,
    }));

    const { error: itemsError } = await supabase
      .from('ranking_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return c.json({ success: true, data: topicData });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Update topic
topics.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const supabase = createAdminClient(c.env);

    const { data, error } = await supabase
      .from('ranking_topics')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Delete topic
topics.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = createAdminClient(c.env);

    // Delete items first (foreign key constraint)
    await supabase.from('ranking_items').delete().eq('topic_id', id);

    // Delete topic
    const { error } = await supabase
      .from('ranking_topics')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

export default topics;
