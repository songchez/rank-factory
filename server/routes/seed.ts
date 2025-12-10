import { Hono } from 'hono';
import { ensureSeeded, seedAll } from '../lib/seed';

const seed = new Hono();

seed.get('/', async (c) => {
  try {
    const results = await ensureSeeded(c.env);
    return c.json({ success: true, results });
  } catch (error) {
    return c.json(
      { success: false, error: (error as Error).message },
      500
    );
  }
});

seed.post('/all', async (c) => {
  try {
    const results = await seedAll(c.env);
    return c.json({ success: true, results });
  } catch (error) {
    return c.json(
      { success: false, error: (error as Error).message },
      500
    );
  }
});

export default seed;
