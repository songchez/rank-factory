import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import app from './app';
import seedRoutes from './routes/seed';

const port = process.env.PORT || 8787;

// Create a wrapper app for local development with static file serving
const devApp = new Hono();

// Mount API routes
devApp.route('/', app);

// Seed routes only available in local development
devApp.route('/api/seed', seedRoutes);

// Serve static files from dist/client
devApp.use('/*', serveStatic({ root: './dist/client' }));

// SPA fallback - serve index.html for all other routes
devApp.get('*', serveStatic({ path: './dist/client/index.html' }));

export default {
  port,
  fetch: devApp.fetch,
};

console.log(`Server running on http://localhost:${port}`);
