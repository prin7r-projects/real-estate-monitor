import { Hono } from 'hono';
import { db } from '../db';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm';
import { pollerManager } from '../index';

export const sourcesRouter = new Hono();

// GET /api/v1/sources - List all sources (operator only)
sourcesRouter.get('/sources', async (c) => {
  // TODO: Check if user is operator
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const allSources = await db
    .select()
    .from(sources)
    .orderBy(sources.key);

  // Get poller status
  const pollerStatus = pollerManager.getPollerStatus();
  
  const sourcesWithStatus = allSources.map(source => ({
    ...source,
    isPollerRunning: pollerStatus.get(source.key)?.isRunning || false,
  }));

  return c.json({ sources: sourcesWithStatus });
});

// POST /api/v1/sources/:id/restart - Restart a source (operator only)
sourcesRouter.post('/sources/:id/restart', async (c) => {
  // TODO: Check if user is operator
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const sourceId = c.req.param('id');

  // Get source by ID
  const [source] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }

  // Restart the poller
  const success = await pollerManager.restartPoller(source.key);

  if (!success) {
    return c.json({ error: 'Failed to restart poller' }, 500);
  }

  // Fetch updated source
  const [updatedSource] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  return c.json({ source: updatedSource });
});

// POST /api/v1/sources/:id/start - Start a source (operator only)
sourcesRouter.post('/sources/:id/start', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const sourceId = c.req.param('id');

  const [source] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }

  const success = await pollerManager.startPoller(source.key);

  if (!success) {
    return c.json({ error: 'Failed to start poller' }, 500);
  }

  const [updatedSource] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  return c.json({ source: updatedSource });
});

// POST /api/v1/sources/:id/stop - Stop a source (operator only)
sourcesRouter.post('/sources/:id/stop', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const sourceId = c.req.param('id');

  const [source] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }

  const success = await pollerManager.stopPoller(source.key);

  if (!success) {
    return c.json({ error: 'Failed to stop poller' }, 500);
  }

  const [updatedSource] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, sourceId));

  return c.json({ source: updatedSource });
});
