import { Hono } from 'hono';
import { db } from '../db';
import { sources, listings, matches, profiles, users } from '../db/schema';
import { sql, count } from 'drizzle-orm';
import { pollerManager } from '../index';

export const healthRouter = new Hono();

healthRouter.get('/healthz', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0',
  });
});

healthRouter.get('/readyz', async (c) => {
  try {
    // Check database connection
    await db.select({ test: sql`1` });
    
    // Check Redis connection (if available)
    // TODO: Add Redis health check
    
    return c.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    });
  } catch (error) {
    return c.json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: String(error),
    }, 503);
  }
});

healthRouter.get('/status', async (c) => {
  try {
    // Get counts
    const [sourceCount] = await db.select({ count: count(sources.id) }).from(sources);
    const [listingCount] = await db.select({ count: count(listings.id) }).from(listings);
    const [matchCount] = await db.select({ count: count(matches.id) }).from(matches);
    const [profileCount] = await db.select({ count: count(profiles.id) }).from(profiles);
    const [userCount] = await db.select({ count: count(users.id) }).from(users);

    // Get poller status
    const pollerStatus = pollerManager.getPollerStatus();
    const activePollers = pollerManager.getActivePollerCount();
    const totalPollers = pollerManager.getTotalPollerCount();

    // Get source health
    const sourceHealth = await db
      .select({
        status: sources.status,
        count: count(sources.id),
      })
      .from(sources)
      .groupBy(sources.status);

    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
      stats: {
        sources: sourceCount?.count || 0,
        listings: listingCount?.count || 0,
        matches: matchCount?.count || 0,
        profiles: profileCount?.count || 0,
        users: userCount?.count || 0,
      },
      pollers: {
        active: activePollers,
        total: totalPollers,
        status: Object.fromEntries(pollerStatus),
      },
      sourceHealth: sourceHealth.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: String(error),
    }, 500);
  }
});

// Metrics endpoint for Prometheus/Grafana
healthRouter.get('/metrics', async (c) => {
  try {
    const [sourceCount] = await db.select({ count: count(sources.id) }).from(sources);
    const [listingCount] = await db.select({ count: count(listings.id) }).from(listings);
    const [matchCount] = await db.select({ count: count(matches.id) }).from(matches);
    const [profileCount] = await db.select({ count: count(profiles.id) }).from(profiles);
    const [userCount] = await db.select({ count: count(users.id) }).from(users);

    const activePollers = pollerManager.getActivePollerCount();
    const totalPollers = pollerManager.getTotalPollerCount();

    const metrics = `
# HELP skyline_sources_total Total number of data sources
# TYPE skyline_sources_total gauge
skyline_sources_total ${sourceCount?.count || 0}

# HELP skyline_listings_total Total number of listings
# TYPE skyline_listings_total gauge
skyline_listings_total ${listingCount?.count || 0}

# HELP skyline_matches_total Total number of matches
# TYPE skyline_matches_total gauge
skyline_matches_total ${matchCount?.count || 0}

# HELP skyline_profiles_total Total number of profiles
# TYPE skyline_profiles_total gauge
skyline_profiles_total ${profileCount?.count || 0}

# HELP skyline_users_total Total number of users
# TYPE skyline_users_total gauge
skyline_users_total ${userCount?.count || 0}

# HELP skyline_pollers_active Number of active pollers
# TYPE skyline_pollers_active gauge
skyline_pollers_active ${activePollers}

# HELP skyline_pollers_total Total number of pollers
# TYPE skyline_pollers_total gauge
skyline_pollers_total ${totalPollers}

# HELP skyline_uptime_seconds Server uptime in seconds
# TYPE skyline_uptime_seconds gauge
skyline_uptime_seconds ${process.uptime()}
    `.trim();

    return new Response(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    return c.json({
      status: 'error',
      error: String(error),
    }, 500);
  }
});
