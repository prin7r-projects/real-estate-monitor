import { db } from '../db';
import { listings, sources } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

export interface PollerConfig {
  sourceKey: string;
  city: string;
  pollIntervalS: number;
}

export interface RawListing {
  externalId: string;
  title: string;
  price: number;
  currency: string;
  sqm?: number;
  bedrooms?: number;
  address: string;
  latitude?: number;
  longitude?: number;
  publishedAt: Date;
  url: string;
}

export abstract class BasePoller {
  protected config: PollerConfig;
  protected isRunning: boolean = false;
  protected intervalId: NodeJS.Timeout | null = null;

  constructor(config: PollerConfig) {
    this.config = config;
  }

  abstract fetchListings(): Promise<RawListing[]>;

  generateFingerprint(listing: RawListing): string {
    const normalized = [
      this.config.city.toLowerCase(),
      listing.address.toLowerCase().trim(),
      listing.sqm?.toString() || '',
      listing.bedrooms?.toString() || '',
      Math.round(listing.price * 0.02).toString(), // ±2% price tolerance
      listing.publishedAt.toISOString().split('T')[0], // date only
    ].join('|');

    return createHash('sha256').update(normalized).digest('hex').slice(0, 32);
  }

  async ingest(): Promise<{ new: number; duplicates: number; errors: number }> {
    const stats = { new: 0, duplicates: 0, errors: 0 };

    try {
      console.log(`[SKYLINE_INGEST] Polling ${this.config.sourceKey}...`);
      
      const rawListings = await this.fetchListings();
      console.log(`[SKYLINE_INGEST] Fetched ${rawListings.length} listings from ${this.config.sourceKey}`);

      for (const raw of rawListings) {
        try {
          const fingerprint = this.generateFingerprint(raw);

          // Check if listing already exists
          const existing = await db
            .select({ id: listings.id })
            .from(listings)
            .where(eq(listings.fingerprint, fingerprint))
            .limit(1);

          if (existing.length > 0) {
            // Update lastSeenAt
            await db
              .update(listings)
              .set({ lastSeenAt: new Date() })
              .where(eq(listings.fingerprint, fingerprint));
            stats.duplicates++;
            continue;
          }

          // Insert new listing
          await db.insert(listings).values({
            sourceKey: this.config.sourceKey,
            city: this.config.city,
            side: raw.title.toLowerCase().includes('rent') ? 'rent' : 'sale',
            priceCents: Math.round(raw.price * 100),
            sqm: raw.sqm,
            bedrooms: raw.bedrooms,
            addressNorm: raw.address,
            publishedAt: raw.publishedAt,
            fingerprint,
          });

          stats.new++;
        } catch (err) {
          console.error(`[SKYLINE_INGEST] Error processing listing:`, err);
          stats.errors++;
        }
      }

      // Update source last success
      await db
        .update(sources)
        .set({ lastSuccessAt: new Date(), status: 'healthy' })
        .where(eq(sources.key, this.config.sourceKey));

      console.log(`[SKYLINE_INGEST] ${this.config.sourceKey}: ${stats.new} new, ${stats.duplicates} dupes, ${stats.errors} errors`);
    } catch (err) {
      console.error(`[SKYLINE_INGEST] Poller error for ${this.config.sourceKey}:`, err);
      
      // Mark source as degraded
      await db
        .update(sources)
        .set({ status: 'degraded' })
        .where(eq(sources.key, this.config.sourceKey));
      
      stats.errors++;
    }

    return stats;
  }

  start(): void {
    if (this.isRunning) return;

    console.log(`[SKYLINE_INGEST] Starting poller for ${this.config.sourceKey} (interval: ${this.config.pollIntervalS}s)`);
    
    this.isRunning = true;
    
    // Initial poll
    this.ingest();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.ingest();
    }, this.config.pollIntervalS * 1000);
  }

  stop(): void {
    if (!this.isRunning) return;

    console.log(`[SKYLINE_INGEST] Stopping poller for ${this.config.sourceKey}`);
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
