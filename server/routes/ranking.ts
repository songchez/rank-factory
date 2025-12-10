import { Hono } from 'hono';
import { createClient } from '../lib/supabase';
import { ELO_K_FACTOR } from '../../shared/constants';
import { ensureSeeded, buildOfflineSeed } from '../lib/seed';

function hasSupabaseEnv(env?: any) {
  const supabaseUrl = env?.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const supabaseKey =
    env?.SUPABASE_SERVICE_ROLE_KEY ||
    env?.SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== 'undefined' && (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY));
  return !!(supabaseUrl && supabaseKey);
}

const ranking = new Hono();

// Get ranking items for a topic
ranking.get('/:topicId/items', async (c) => {
  try {
    const seeded = await ensureSeeded(c.env);
    const offlineData = seeded.offlineData ?? [];
    if (!hasSupabaseEnv(c.env) && offlineData.length > 0) {
      const offline = offlineData.find((t) => t.id === c.req.param('topicId'));
      if (!offline) return c.json({ success: false, error: 'Not found' }, 404);
      return c.json({ success: true, data: offline.items });
    }

    const topicId = c.req.param('topicId');
    const supabase = createClient(c);

    const { data, error } = await supabase
      .from('ranking_items')
      .select('*')
      .eq('topic_id', topicId)
      .order('elo_score', { ascending: false });

    if (error) throw error;

    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Get random pair for battle
ranking.get('/:topicId/pair', async (c) => {
  try {
    const seeded = await ensureSeeded(c.env);
    const offlineData = seeded.offlineData ?? [];
    if (!hasSupabaseEnv(c.env) && offlineData.length > 0) {
      const offline = offlineData.find((t) => t.id === c.req.param('topicId'));
      if (!offline || offline.items.length < 2) {
        return c.json({ success: false, error: 'Not enough items' }, 400);
      }
      const shuffled = offline.items.sort(() => 0.5 - Math.random()).slice(0, 2);
      return c.json({ success: true, data: shuffled });
    }

    const topicId = c.req.param('topicId');
    const supabase = createClient(c);

    const { data, error } = await supabase
      .from('ranking_items')
      .select('*')
      .eq('topic_id', topicId);

    if (error) throw error;

    if (!data || data.length < 2) {
      return c.json({ success: false, error: 'Not enough items' }, 400);
    }

    // Get random pair
    const shuffled = data.sort(() => 0.5 - Math.random());
    const pair = shuffled.slice(0, 2);

    return c.json({ success: true, data: pair });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

// Submit vote and update ELO
ranking.post('/:topicId/vote', async (c) => {
  try {
    const seeded = await ensureSeeded(c.env);
    const offlineData = seeded.offlineData ?? [];
    if (!hasSupabaseEnv(c.env) && offlineData.length > 0) {
      const offline = offlineData.find((t) => t.id === c.req.param('topicId'));
      if (!offline || offline.items.length < 2) {
        return c.json({ success: false, error: 'Not enough items' }, 400);
      }
      const { winnerId, loserId } = await c.req.json();
      return c.json({
        success: true,
        data: {
          winner: { id: winnerId, oldElo: 1200, newElo: 1200 },
          loser: { id: loserId, oldElo: 1200, newElo: 1200 },
        },
        note: 'offline seed mode (no persistence)',
      });
    }

    const topicId = c.req.param('topicId');
    const { winnerId, loserId } = await c.req.json();

    if (!winnerId || !loserId) {
      return c.json({ success: false, error: 'Winner and loser IDs required' }, 400);
    }

    const supabase = createClient(c);

    // Get current items
    const { data: items, error: fetchError } = await supabase
      .from('ranking_items')
      .select('*')
      .in('id', [winnerId, loserId]);

    if (fetchError) throw fetchError;

    if (!items || items.length !== 2) {
      return c.json({ success: false, error: 'Items not found' }, 404);
    }

    const winner = items.find((item) => item.id === winnerId)!;
    const loser = items.find((item) => item.id === loserId)!;

    // Calculate ELO
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo_score - winner.elo_score) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo_score - loser.elo_score) / 400));

    const newWinnerElo = Math.round(winner.elo_score + ELO_K_FACTOR * (1 - expectedWinner));
    const newLoserElo = Math.round(loser.elo_score + ELO_K_FACTOR * (0 - expectedLoser));

    // Update winner
    await supabase
      .from('ranking_items')
      .update({
        elo_score: newWinnerElo,
        win_count: winner.win_count + 1,
        match_count: winner.match_count + 1,
      })
      .eq('id', winnerId);

    // Update loser
    await supabase
      .from('ranking_items')
      .update({
        elo_score: newLoserElo,
        loss_count: loser.loss_count + 1,
        match_count: loser.match_count + 1,
      })
      .eq('id', loserId);

    return c.json({
      success: true,
      data: {
        winner: { id: winnerId, oldElo: winner.elo_score, newElo: newWinnerElo },
        loser: { id: loserId, oldElo: loser.elo_score, newElo: newLoserElo }
      }
    });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

export default ranking;
