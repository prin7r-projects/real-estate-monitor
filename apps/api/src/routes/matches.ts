import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { matches, profiles, listings } from '../db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export const matchesRouter = new Hono();

const getMatchesSchema = z.object({
  profileId: z.string().uuid().optional(),
  since: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

// GET /api/v1/matches - Get user's matches
matchesRouter.get('/matches', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';
  
  const query = c.req.query();
  const parsed = getMatchesSchema.safeParse({
    profileId: query.profileId,
    since: query.since,
    limit: query.limit ? parseInt(query.limit) : 50,
  });

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const { profileId, since, limit } = parsed.data;

  // Build query conditions
  const conditions = [eq(profiles.userId, userId)];
  
  if (profileId) {
    conditions.push(eq(matches.profileId, profileId));
  }
  
  if (since) {
    conditions.push(gte(matches.matchedAt, new Date(since)));
  }

  const userMatches = await db
    .select({
      id: matches.id,
      score: matches.score,
      signals: matches.signals,
      matchedAt: matches.matchedAt,
      deliveredEmailAt: matches.deliveredEmailAt,
      deliveredTgAt: matches.deliveredTgAt,
      profile: {
        id: profiles.id,
        name: profiles.name,
        city: profiles.city,
      },
      listing: {
        id: listings.id,
        sourceKey: listings.sourceKey,
        city: listings.city,
        side: listings.side,
        priceCents: listings.priceCents,
        sqm: listings.sqm,
        bedrooms: listings.bedrooms,
        addressNorm: listings.addressNorm,
      },
    })
    .from(matches)
    .innerJoin(profiles, eq(matches.profileId, profiles.id))
    .innerJoin(listings, eq(matches.listingId, listings.id))
    .where(and(...conditions))
    .orderBy(desc(matches.matchedAt))
    .limit(limit);

  return c.json({ matches: userMatches });
});

// GET /api/v1/matches/:id - Get match details
matchesRouter.get('/matches/:id', async (c) => {
  const userId = c.req.header('X-User-Id') || 'anonymous';
  const matchId = c.req.param('id');

  const [match] = await db
    .select({
      id: matches.id,
      score: matches.score,
      signals: matches.signals,
      matchedAt: matches.matchedAt,
      deliveredEmailAt: matches.deliveredEmailAt,
      deliveredTgAt: matches.deliveredTgAt,
      profile: {
        id: profiles.id,
        name: profiles.name,
        city: profiles.city,
        side: profiles.side,
        minPriceCents: profiles.minPriceCents,
        maxPriceCents: profiles.maxPriceCents,
        minBedrooms: profiles.minBedrooms,
        radiusKm: profiles.radiusKm,
      },
      listing: {
        id: listings.id,
        sourceKey: listings.sourceKey,
        city: listings.city,
        side: listings.side,
        priceCents: listings.priceCents,
        sqm: listings.sqm,
        bedrooms: listings.bedrooms,
        addressNorm: listings.addressNorm,
        publishedAt: listings.publishedAt,
      },
    })
    .from(matches)
    .innerJoin(profiles, eq(matches.profileId, profiles.id))
    .innerJoin(listings, eq(matches.listingId, listings.id))
    .where(and(eq(matches.id, matchId), eq(profiles.userId, userId)));

  if (!match) {
    return c.json({ error: 'Match not found' }, 404);
  }

  return c.json({ match });
});
