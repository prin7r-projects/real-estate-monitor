import { Hono } from 'hono';
import { db } from '../db';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm';

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

  return c.json({ sources: allSources });
});

// POST /api/v1/sources/:id/restart - Restart a source (operator only)
sourcesRouter.post('/sources/:id/restart', async (c) => {
  // TODO: Check if user is operator
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const sourceId = c.req.param('id');

  const [source] = await db
    .update(sources)
    .set({ status: 'healthy' })
    .where(eq(sources.id, sourceId))
    .returning();

  if (!source) {
    return c.json({ error: 'Source not found' }, 404);
  }

  return c.json({ source });
});
