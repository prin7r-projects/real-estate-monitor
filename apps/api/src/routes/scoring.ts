import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { listings, profiles, matches } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ScoringEngine } from '../scoring';

export const scoringRouter = new Hono();

const scoringEngine = new ScoringEngine();

// POST /api/v1/scoring/score - Score a listing against a profile
scoringRouter.post('/scoring/score', async (c) => {
  const body = await c.req.json();
  
  const schema = z.object({
    listingId: z.string().uuid(),
    profileId: z.string().uuid(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const { listingId, profileId } = parsed.data;

  // Get listing
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!listing) {
    return c.json({ error: 'Listing not found' }, 404);
  }

  // Get profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId));

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  // Score the listing
  const scored = await scoringEngine.scoreListing(listing, profile);

  if (!scored) {
    return c.json({ 
      error: 'Listing does not match profile hard filters',
      isMatch: false,
    });
  }

  return c.json({
    listingId,
    profileId,
    score: scored.score,
    signals: scored.signals,
    threshold: scored.threshold,
    isMatch: scored.isMatch,
  });
});

// POST /api/v1/scoring/comp-baseline - Get comp baseline for a city
scoringRouter.post('/scoring/comp-baseline', async (c) => {
  const body = await c.req.json();
  
  const schema = z.object({
    city: z.string(),
    side: z.enum(['rent', 'sale']).optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const { city, side } = parsed.data;

  // Create a dummy listing to get comp baseline
  const dummyListing = {
    id: '00000000-0000-0000-0000-000000000000',
    city,
    side: side || 'rent',
    priceCents: 0,
    sqm: null,
    bedrooms: null,
    addressNorm: '',
    location: null,
    publishedAt: new Date(),
    lastSeenAt: new Date(),
    fingerprint: '',
    sourceKey: '',
  };

  const baseline = await scoringEngine.calculateCompBaseline(dummyListing);

  return c.json({
    city,
    side: side || 'rent',
    baseline,
  });
});

// GET /api/v1/scoring/threshold - Get current match threshold
scoringRouter.get('/scoring/threshold', (c) => {
  return c.json({
    threshold: scoringEngine.getMatchThreshold(),
  });
});

// PUT /api/v1/scoring/threshold - Update match threshold (operator only)
scoringRouter.put('/scoring/threshold', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const body = await c.req.json();
  
  const schema = z.object({
    threshold: z.number().min(0).max(1),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  scoringEngine.setMatchThreshold(parsed.data.threshold);

  return c.json({
    threshold: scoringEngine.getMatchThreshold(),
  });
});

// GET /api/v1/scoring/weights - Get scoring weights
scoringRouter.get('/scoring/weights', (c) => {
  return c.json({
    weights: scoringEngine.getWeights(),
  });
});

// PUT /api/v1/scoring/weights - Update scoring weights (operator only)
scoringRouter.put('/scoring/weights', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const body = await c.req.json();
  
  const schema = z.object({
    residual: z.number().min(0).max(1).optional(),
    velocity: z.number().min(0).max(1).optional(),
    dom: z.number().min(0).max(1).optional(),
    quality: z.number().min(0).max(1).optional(),
    fit: z.number().min(0).max(1).optional(),
    freshness: z.number().min(0).max(1).optional(),
    anomaly: z.number().min(0).max(1).optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  scoringEngine.setWeights(parsed.data);

  return c.json({
    weights: scoringEngine.getWeights(),
  });
});
