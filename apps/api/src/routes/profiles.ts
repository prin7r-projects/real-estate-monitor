import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { profiles } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const profilesRouter = new Hono();

const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  side: z.enum(['rent', 'sale', 'both']).default('rent'),
  minPriceCents: z.number().int().min(0).default(0),
  maxPriceCents: z.number().int().min(0).default(0),
  minBedrooms: z.number().int().min(0).max(10).default(1),
  radiusKm: z.number().min(0.5).max(100).default(5.0),
  extras: z.record(z.unknown()).default({}),
});

const updateProfileSchema = createProfileSchema.partial();

// GET /api/v1/profiles - List user's profiles
profilesRouter.get('/profiles', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';
  
  const userProfiles = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .orderBy(profiles.createdAt);

  return c.json({ profiles: userProfiles });
});

// POST /api/v1/profiles - Create new profile
profilesRouter.post('/profiles', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';
  
  const body = await c.req.json();
  const parsed = createProfileSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const [profile] = await db
    .insert(profiles)
    .values({
      userId,
      ...parsed.data,
    })
    .returning();

  return c.json({ profile }, 201);
});

// GET /api/v1/profiles/:id - Get profile details
profilesRouter.get('/profiles/:id', async (c) => {
  const userId = c.req.header('X-User-Id') || 'anonymous';
  const profileId = c.req.param('id');

  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)));

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({ profile });
});

// PATCH /api/v1/profiles/:id - Update profile
profilesRouter.patch('/profiles/:id', async (c) => {
  const userId = c.req.header('X-User-Id') || 'anonymous';
  const profileId = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateProfileSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const [profile] = await db
    .update(profiles)
    .set(parsed.data)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .returning();

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({ profile });
});

// POST /api/v1/profiles/:id/pause - Pause profile
profilesRouter.post('/profiles/:id/pause', async (c) => {
  const userId = c.req.header('X-User-Id') || 'anonymous';
  const profileId = c.req.param('id');

  const [profile] = await db
    .update(profiles)
    .set({ status: 'paused' })
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .returning();

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({ profile });
});

// POST /api/v1/profiles/:id/resume - Resume profile
profilesRouter.post('/profiles/:id/resume', async (c) => {
  const userId = c.req.header('X-User-Id') || 'anonymous';
  const profileId = c.req.param('id');

  const [profile] = await db
    .update(profiles)
    .set({ status: 'active' })
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .returning();

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({ profile });
});
