import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import app from './app';

const port = process.env.PORT || 8787;

// Create a wrapper app for local development with static file serving
const devApp = new Hono();

// Mount API routes
devApp.route('/', app);

// Serve static files from dist/client
devApp.use('/*', serveStatic({ root: './dist/client' }));

// SPA fallback - serve index.html for all other routes
devApp.get('*', serveStatic({ path: './dist/client/index.html' }));

export default {
  port,
  fetch: devApp.fetch,
};

console.log(`Server running on http://localhost:${port}`);
