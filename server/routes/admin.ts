import { Hono } from 'hono';
import { createAdminClient } from '../lib/supabase';
import { generateTopicContent, generateImage } from '../lib/ai';

const admin = new Hono();

// Admin middleware - check if user is authenticated
admin.use('*', async (c, next) => {
  // For now, we'll skip auth check
  // TODO: Implement proper admin authentication
  await next();
});

// Create new topic with AI generation
admin.post('/topics/new', async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt) {
      return c.json({ success: false, error: 'Prompt is required' }, 400);
    }

    // Generate topic content
    const generatedTopic = await generateTopicContent(prompt, c.env);

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

    return c.json({ success: true, data: { ...topicData, items: itemsWithImages } });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Update topic
admin.put('/topics/:id', async (c) => {
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
admin.delete('/topics/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = createAdminClient(c.env);

    // Delete items first
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

export default admin;
