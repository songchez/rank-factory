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

// Upload image (data URL -> Supabase Storage)
admin.post('/upload-image', async (c) => {
  try {
    const { dataUrl, filename } = await c.req.json();
    if (!dataUrl || typeof dataUrl !== 'string') {
      return c.json({ success: false, error: 'dataUrl is required' }, 400);
    }

    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) {
      return c.json({ success: false, error: 'Invalid data URL' }, 400);
    }

    const contentType = match[1] || 'image/png';
    const base64Data = match[2];
    const binary = atob(base64Data);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }

    // Require service role key for storage write
    const env = c.env as any;
    const supabaseUrl =
      env?.SUPABASE_URL ||
      env?.VITE_SUPABASE_URL ||
      (typeof process !== 'undefined' && (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL));
    const serviceRoleKey =
      env?.SUPABASE_SERVICE_ROLE_KEY ||
      env?.SUPABASE_SECRET_KEY ||
      (typeof process !== 'undefined' &&
        (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_SECRET_KEY));

    if (!supabaseUrl || !serviceRoleKey) {
      return c.json(
        {
          success: false,
          error: 'Supabase service role key or URL missing; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        },
        400
      );
    }

    const supabase = createAdminClient({
      SUPABASE_URL: supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    });
    const bucket = 'images';

    // Best-effort bucket ensure; if lacking service role, ignore errors
    await supabase.storage
      .createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      })
      .catch(() => undefined);

    const safeName = (filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}.${contentType
      .split('/')[1] || 'png'}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, buffer, { contentType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    const { data: signedData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, 60 * 60 * 24 * 365 * 5); // 5년짜리 서명 URL

    const url = signedData?.signedUrl || publicUrlData.publicUrl;

    return c.json({ success: true, url, path: objectPath, publicUrl: publicUrlData.publicUrl });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Manually create a topic with items
admin.post('/topics', async (c) => {
  try {
    const body = await c.req.json();
    const {
      title,
      category = 'General',
      view_type = 'battle',
      mode,
      items = [],
      meta = {},
    } = body;

    if (!title) return c.json({ success: false, error: 'Title is required' }, 400);
    if (!items.length) return c.json({ success: false, error: 'At least one item is required' }, 400);

    const viewType = (view_type as string).toLowerCase?.() || 'battle';
    const modeByView: Record<string, string> = { battle: 'A', test: 'B', tier: 'C', fact: 'D' };
    const resolvedMode = mode || modeByView[viewType] || 'A';

    const supabase = createAdminClient(c.env);

    const { data: topicData, error: topicError } = await supabase
      .from('ranking_topics')
      .insert({
        title,
        category,
        view_type: viewType,
        mode: resolvedMode,
        meta,
      })
      .select()
      .single();

    if (topicError) throw topicError;

    const itemsToInsert = (items as any[]).map((item, idx) => ({
      topic_id: topicData.id,
      name: item.name,
      image_url: item.image_url || item.imageUrl || '',
      description: item.description || null,
      external_url: item.external_url || item.externalUrl || null,
      meta: item.meta || {},
      rank_order: item.rank_order ?? idx,
      elo_score: item.elo_score ?? 1000,
      win_count: item.win_count ?? 0,
      loss_count: item.loss_count ?? 0,
      match_count: item.match_count ?? 0,
    }));

    const { error: itemsError } = await supabase.from('ranking_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return c.json({ success: true, data: { ...topicData, items: itemsToInsert } });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
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
    const { items, ...topicFields } = body;
    const supabase = createAdminClient(c.env);
    const hasServiceRole =
      !!(
        (c.env as any)?.SUPABASE_SERVICE_ROLE_KEY ||
        (c.env as any)?.SUPABASE_SECRET_KEY ||
        (typeof process !== 'undefined' &&
          (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_SECRET_KEY))
      );

    if (topicFields.view_type) {
      topicFields.view_type = String(topicFields.view_type).toLowerCase();
    }
    if (!topicFields.mode && topicFields.view_type) {
      const modeByView: Record<string, string> = { battle: 'A', test: 'B', tier: 'C', fact: 'D' };
      topicFields.mode = modeByView[topicFields.view_type] || 'A';
    }

    let topicData = null;

    if (Object.keys(topicFields).length > 0) {
      const { data, error } = await supabase
        .from('ranking_topics')
        .update(topicFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      topicData = data;
    }

    if (Array.isArray(items)) {
      const itemsToUpsert = items.map((item: any, idx: number) => {
        const base = {
          topic_id: id,
          name: item.name,
          image_url: item.image_url || item.imageUrl || '',
          description: item.description || null,
          external_url: item.external_url || item.externalUrl || null,
          meta: item.meta || {},
          rank_order: item.rank_order ?? idx,
          elo_score: item.elo_score ?? 1000,
          win_count: item.win_count ?? 0,
          loss_count: item.loss_count ?? 0,
          match_count: item.match_count ?? 0,
        };
        return item.id ? { id: item.id, ...base } : base;
      });

      if (itemsToUpsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('ranking_items')
          .upsert(itemsToUpsert, { onConflict: 'id' });
        if (itemsError) throw itemsError;
      }

      // Delete removed items only when service role is available (RLS bypass)
      if (hasServiceRole) {
        const incomingIds = items.filter((it: any) => it.id).map((it: any) => it.id);
        const { data: existingIds, error: existingError } = await supabase
          .from('ranking_items')
          .select('id')
          .eq('topic_id', id);
        if (existingError) throw existingError;

        const toDelete =
          existingIds
            ?.map((row: any) => row.id)
            .filter((existingId: string) => !incomingIds.includes(existingId)) ?? [];

        if (toDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('ranking_items')
            .delete()
            .in('id', toDelete);
          if (deleteError) throw deleteError;
        }
      }
    }

    if (!topicData) {
      const { data, error } = await supabase
        .from('ranking_topics')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      topicData = data;
    }

    const { data: itemsData } = await supabase
      .from('ranking_items')
      .select('*')
      .eq('topic_id', id)
      .order('rank_order', { ascending: true })
      .order('created_at', { ascending: true });

    return c.json({ success: true, data: { ...topicData, items: itemsData || [] } });
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
