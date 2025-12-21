import { Hono } from 'hono';
import { createAdminClient } from '../lib/supabase';

function hasSupabaseEnv(env?: any) {
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const supabaseKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    env?.SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== 'undefined' && (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY));
  return !!(supabaseUrl && supabaseKey);
}

const games = new Hono();

games.get('/:gameId/leaderboard', async (c) => {
  try {
    if (!hasSupabaseEnv(c.env)) {
      return c.json({ success: true, data: [] });
    }

    const gameId = c.req.param('gameId');
    const limit = Number(c.req.query('limit') || 20);
    const supabase = createAdminClient(c.env);

    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(isNaN(limit) ? 20 : limit);

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

games.post('/:gameId/score', async (c) => {
  try {
    if (!hasSupabaseEnv(c.env)) {
      return c.json({ success: true, data: null, note: 'offline seed mode, score not persisted' });
    }

    const gameId = c.req.param('gameId');
    const body = await c.req.json();
    const { score, meta, userId, sessionId } = body;

    if (typeof score !== 'number' || Number.isNaN(score)) {
      return c.json({ success: false, error: 'score must be a number' }, 400);
    }

    const supabase = createAdminClient(c.env);
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        game_id: gameId,
        score,
        meta: meta ?? {},
        user_id: userId ?? null,
        session_id: sessionId ?? 'anon',
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

export default games;
