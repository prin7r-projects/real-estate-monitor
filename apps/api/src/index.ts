import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { profilesRouter } from './routes/profiles';
import { matchesRouter } from './routes/matches';
import { sourcesRouter } from './routes/sources';
import { scoringRouter } from './routes/scoring';
import { healthRouter } from './routes/health';
import { PollerManager } from './pollers/manager';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://real-estate-monitor.prin7r.com',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.route('/api', healthRouter);
app.route('/api/v1', profilesRouter);
app.route('/api/v1', matchesRouter);
app.route('/api/v1', sourcesRouter);
app.route('/api/v1', scoringRouter);

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'Skyline Watch API',
    version: '0.1.0',
    status: 'running',
  });
});

// Initialize poller manager
const pollerManager = new PollerManager();

// Start server
const port = parseInt(process.env.PORT || '3001');
console.log(`[SKYLINE_API] Starting server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`[SKYLINE_API] Server running at http://localhost:${port}`);

// Start pollers after server is running
if (process.env.START_POLLERS !== 'false') {
  console.log('[SKYLINE_API] Starting poller manager...');
  pollerManager.startAll().catch((error) => {
    console.error('[SKYLINE_API] Failed to start pollers:', error);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[SKYLINE_API] Shutting down...');
  await pollerManager.stopAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[SKYLINE_API] Shutting down...');
  await pollerManager.stopAll();
  process.exit(0);
});

// Export for use in routes
export { pollerManager };
