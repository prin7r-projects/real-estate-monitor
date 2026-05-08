import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { matches, profiles, listings } from '../db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export const exportRouter = new Hono();

// GET /api/v1/export/matches/csv - Export matches as CSV
exportRouter.get('/export/matches/csv', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';

  const query = c.req.query();
  
  const schema = z.object({
    profileId: z.string().uuid().optional(),
    days: z.coerce.number().int().min(1).max(90).default(30),
  });

  const parsed = schema.safeParse({
    profileId: query.profileId,
    days: query.days,
  });

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const { profileId, days } = parsed.data;

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build query conditions
  const conditions = [
    eq(profiles.userId, userId),
    gte(matches.matchedAt, startDate),
  ];

  if (profileId) {
    conditions.push(eq(matches.profileId, profileId));
  }

  // Get matches
  const userMatches = await db
    .select({
      matchId: matches.id,
      matchedAt: matches.matchedAt,
      score: matches.score,
      signals: matches.signals,
      profileName: profiles.name,
      profileCity: profiles.city,
      profileSide: profiles.side,
      listingAddress: listings.addressNorm,
      listingPrice: listings.priceCents,
      listingSqm: listings.sqm,
      listingBedrooms: listings.bedrooms,
      listingCity: listings.city,
      listingSide: listings.side,
      listingSource: listings.sourceKey,
      deliveredEmailAt: matches.deliveredEmailAt,
      deliveredTgAt: matches.deliveredTgAt,
    })
    .from(matches)
    .innerJoin(profiles, eq(matches.profileId, profiles.id))
    .innerJoin(listings, eq(matches.listingId, listings.id))
    .where(and(...conditions))
    .orderBy(desc(matches.matchedAt));

  // Build CSV
  const headers = [
    'Match ID',
    'Matched At',
    'Score',
    'Profile Name',
    'Profile City',
    'Profile Side',
    'Listing Address',
    'Listing Price (EUR)',
    'Listing Size (m²)',
    'Listing Bedrooms',
    'Listing City',
    'Listing Side',
    'Listing Source',
    'Residual Signal',
    'Velocity Signal',
    'DOM Signal',
    'Quality Signal',
    'Fit Signal',
    'Freshness Signal',
    'Anomaly Signal',
    'Delivered Email',
    'Delivered Telegram',
  ];

  const rows = userMatches.map(m => {
    const signals = m.signals as Record<string, number> || {};
    
    return [
      m.matchId,
      m.matchedAt?.toISOString() || '',
      m.score.toString(),
      m.profileName,
      m.profileCity,
      m.profileSide,
      m.listingAddress,
      (m.listingPrice / 100).toFixed(2),
      m.listingSqm?.toString() || '',
      m.listingBedrooms?.toString() || '',
      m.listingCity,
      m.listingSide,
      m.listingSource,
      signals.residual?.toFixed(4) || '',
      signals.velocity?.toFixed(4) || '',
      signals.dom?.toFixed(4) || '',
      signals.quality?.toFixed(4) || '',
      signals.fit?.toFixed(4) || '',
      signals.freshness?.toFixed(4) || '',
      signals.anomaly?.toFixed(4) || '',
      m.deliveredEmailAt?.toISOString() || '',
      m.deliveredTgAt?.toISOString() || '',
    ];
  });

  // Escape CSV values
  const escapeCsv = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n');

  // Return CSV
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="skyline-watch-matches-${days}d.csv"`,
    },
  });
});

// GET /api/v1/export/matches/json - Export matches as JSON
exportRouter.get('/export/matches/json', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';

  const query = c.req.query();
  
  const schema = z.object({
    profileId: z.string().uuid().optional(),
    days: z.coerce.number().int().min(1).max(90).default(30),
  });

  const parsed = schema.safeParse({
    profileId: query.profileId,
    days: query.days,
  });

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const { profileId, days } = parsed.data;

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Build query conditions
  const conditions = [
    eq(profiles.userId, userId),
    gte(matches.matchedAt, startDate),
  ];

  if (profileId) {
    conditions.push(eq(matches.profileId, profileId));
  }

  // Get matches
  const userMatches = await db
    .select({
      match: matches,
      profile: {
        id: profiles.id,
        name: profiles.name,
        city: profiles.city,
        side: profiles.side,
      },
      listing: {
        id: listings.id,
        addressNorm: listings.addressNorm,
        priceCents: listings.priceCents,
        sqm: listings.sqm,
        bedrooms: listings.bedrooms,
        city: listings.city,
        side: listings.side,
        sourceKey: listings.sourceKey,
      },
    })
    .from(matches)
    .innerJoin(profiles, eq(matches.profileId, profiles.id))
    .innerJoin(listings, eq(matches.listingId, listings.id))
    .where(and(...conditions))
    .orderBy(desc(matches.matchedAt));

  return c.json({
    exportDate: new Date().toISOString(),
    days,
    totalMatches: userMatches.length,
    matches: userMatches,
  });
});
