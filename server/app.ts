import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import authRoutes from './routes/auth';
import topicsRoutes from './routes/topics';
import rankingRoutes from './routes/ranking';
import adminRoutes from './routes/admin';
import gamesRoutes from './routes/games';
import commentsRoutes from './routes/comments';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return origin;
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    // Allow your production domain
    if (origin.includes('rank-factory')) {
      return origin;
    }
    return origin;
  },
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/topics', topicsRoutes);
app.route('/api/ranking', rankingRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/games', gamesRoutes);
app.route('/api/comments', commentsRoutes);

export default app;
