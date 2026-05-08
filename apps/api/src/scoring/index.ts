import { db } from '../db';
import { listings, matches, profiles, type Listing, type Profile } from '../db/schema';
import { eq, and, gte, desc, sql, avg, stddev, count } from 'drizzle-orm';

export interface ScoreSignals {
  residual: number;      // Price vs comp baseline
  velocity: number;      // Price cut velocity
  dom: number;           // Days on market context
  quality: number;       // Listing quality score
  fit: number;           // Profile fit score
  freshness: number;     // How fresh the listing is
  anomaly: number;       // Anomaly detection score
}

export interface ScoredListing {
  listing: Listing;
  score: number;
  signals: ScoreSignals;
  threshold: number;
  isMatch: boolean;
}

export interface CompBaseline {
  median: number;
  mad: number;
  mean: number;
  stddev: number;
  count: number;
}

export class ScoringEngine {
  private weights: Record<keyof ScoreSignals, number> = {
    residual: 0.25,
    velocity: 0.15,
    dom: 0.10,
    quality: 0.10,
    fit: 0.20,
    freshness: 0.10,
    anomaly: 0.10,
  };

  private matchThreshold: number = 0.7;

  async scoreListing(listing: Listing, profile: Profile): Promise<ScoredListing | null> {
    // Check hard filters first
    if (!this.passesHardFilters(listing, profile)) {
      return null;
    }

    // Calculate comp baseline
    const compBaseline = await this.calculateCompBaseline(listing);
    
    // Calculate all signals
    const signals: ScoreSignals = {
      residual: this.calculateResidual(listing, compBaseline),
      velocity: await this.calculateVelocity(listing),
      dom: this.calculateDOM(listing),
      quality: this.calculateQuality(listing),
      fit: this.calculateFit(listing, profile),
      freshness: this.calculateFreshness(listing),
      anomaly: await this.calculateAnomaly(listing),
    };

    // Calculate weighted score
    const score = Object.entries(this.weights).reduce((total, [key, weight]) => {
      return total + (signals[key as keyof ScoreSignals] * weight);
    }, 0);

    const roundedScore = Math.round(score * 100) / 100;

    return {
      listing,
      score: roundedScore,
      signals,
      threshold: this.matchThreshold,
      isMatch: roundedScore >= this.matchThreshold,
    };
  }

  private passesHardFilters(listing: Listing, profile: Profile): boolean {
    // City match
    if (listing.city.toLowerCase() !== profile.city.toLowerCase()) {
      return false;
    }

    // Side match
    if (profile.side !== 'both' && listing.side !== profile.side) {
      return false;
    }

    // Price range
    if (profile.maxPriceCents > 0 && listing.priceCents > profile.maxPriceCents) {
      return false;
    }
    if (profile.minPriceCents > 0 && listing.priceCents < profile.minPriceCents) {
      return false;
    }

    // Bedrooms
    if (profile.minBedrooms > 0 && listing.bedrooms && listing.bedrooms < profile.minBedrooms) {
      return false;
    }

    return true;
  }

  async calculateCompBaseline(listing: Listing): Promise<CompBaseline> {
    // Get 30-day comparable listings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await db
      .select({
        avg: avg(listings.priceCents),
        stddev: stddev(listings.priceCents),
        count: count(listings.id),
      })
      .from(listings)
      .where(
        and(
          eq(listings.city, listing.city),
          eq(listings.side, listing.side),
          gte(listings.publishedAt, thirtyDaysAgo),
          sql`${listings.id} != ${listing.id}`
        )
      );

    const result = stats[0];
    
    if (!result || result.count === 0) {
      return {
        median: listing.priceCents,
        mad: 0,
        mean: listing.priceCents,
        stddev: 0,
        count: 0,
      };
    }

    // Calculate median and MAD
    const prices = await db
      .select({ priceCents: listings.priceCents })
      .from(listings)
      .where(
        and(
          eq(listings.city, listing.city),
          eq(listings.side, listing.side),
          gte(listings.publishedAt, thirtyDaysAgo),
          sql`${listings.id} != ${listing.id}`
        )
      )
      .orderBy(listings.priceCents);

    const priceValues = prices.map(p => p.priceCents);
    const median = this.calculateMedian(priceValues);
    const mad = this.calculateMAD(priceValues, median);

    return {
      median,
      mad,
      mean: Number(result.avg) || listing.priceCents,
      stddev: Number(result.stddev) || 0,
      count: Number(result.count) || 0,
    };
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateMAD(values: number[], median: number): number {
    if (values.length === 0) return 0;
    
    const deviations = values.map(v => Math.abs(v - median));
    return this.calculateMedian(deviations);
  }

  private calculateResidual(listing: Listing, comp: CompBaseline): number {
    if (comp.mad === 0) return 0.5;
    
    const residual = (listing.priceCents - comp.median) / comp.mad;
    
    // Negative residual = underpriced = higher score
    // Normalize to 0-1 range
    const score = 0.5 - residual * 0.1;
    return Math.max(0, Math.min(1, score));
  }

  private async calculateVelocity(listing: Listing): Promise<number> {
    // Check for price cuts in history
    // Look for listings with same fingerprint but lower price
    const priceHistory = await db
      .select({
        priceCents: listings.priceCents,
        publishedAt: listings.publishedAt,
      })
      .from(listings)
      .where(
        and(
          eq(listings.fingerprint, listing.fingerprint),
          sql`${listings.id} != ${listing.id}`
        )
      )
      .orderBy(desc(listings.publishedAt))
      .limit(5);

    if (priceHistory.length === 0) {
      return 0.5; // No history
    }

    // Check for price cuts
    let priceCuts = 0;
    let totalCuts = 0;

    for (let i = 0; i < priceHistory.length; i++) {
      if (priceHistory[i].priceCents < listing.priceCents) {
        priceCuts++;
        totalCuts += (listing.priceCents - priceHistory[i].priceCents) / listing.priceCents;
      }
    }

    if (priceCuts === 0) return 0.5;

    // Higher velocity = more aggressive cuts = higher score
    const avgCut = totalCuts / priceCuts;
    const velocity = Math.min(1, avgCut * 10); // Scale up
    
    return velocity;
  }

  private calculateDOM(listing: Listing): number {
    const now = new Date();
    const dom = Math.floor((now.getTime() - listing.publishedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Newer listings get higher scores
    if (dom <= 1) return 1.0;
    if (dom <= 3) return 0.8;
    if (dom <= 7) return 0.6;
    if (dom <= 14) return 0.4;
    if (dom <= 30) return 0.2;
    return 0.1;
  }

  private calculateQuality(listing: Listing): number {
    let score = 0.5;
    
    // Has sqm
    if (listing.sqm && listing.sqm > 0) score += 0.15;
    
    // Has bedrooms
    if (listing.bedrooms && listing.bedrooms > 0) score += 0.15;
    
    // Has address
    if (listing.addressNorm && listing.addressNorm.length > 0) score += 0.1;
    
    // Has location (PostGIS point)
    if (listing.location) score += 0.1;
    
    return Math.min(1, score);
  }

  private calculateFit(listing: Listing, profile: Profile): number {
    let score = 0;
    let factors = 0;

    // Price fit
    if (profile.maxPriceCents > 0) {
      const priceRatio = listing.priceCents / profile.maxPriceCents;
      if (priceRatio <= 0.8) score += 1;
      else if (priceRatio <= 0.9) score += 0.8;
      else if (priceRatio <= 1.0) score += 0.6;
      else score += 0.2;
      factors++;
    }

    // Bedroom fit
    if (profile.minBedrooms > 0 && listing.bedrooms) {
      if (listing.bedrooms >= profile.minBedrooms) {
        score += 1;
      } else {
        score += 0.3;
      }
      factors++;
    }

    // SQM fit (if available)
    if (listing.sqm && profile.extras && typeof profile.extras === 'object') {
      const extras = profile.extras as Record<string, unknown>;
      if (extras.minSqm && typeof extras.minSqm === 'number') {
        if (listing.sqm >= extras.minSqm) {
          score += 1;
        } else {
          score += 0.3;
        }
        factors++;
      }
    }

    return factors > 0 ? score / factors : 0.5;
  }

  private calculateFreshness(listing: Listing): number {
    const now = new Date();
    const hours = (now.getTime() - listing.publishedAt.getTime()) / (1000 * 60 * 60);
    
    if (hours <= 1) return 1.0;
    if (hours <= 6) return 0.9;
    if (hours <= 24) return 0.7;
    if (hours <= 72) return 0.5;
    if (hours <= 168) return 0.3;
    return 0.1;
  }

  private async calculateAnomaly(listing: Listing): Promise<number> {
    // Check for anomalies like:
    // - Relisted multiple times
    // - Descending prices
    // - Unusual patterns
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count how many times this listing has been seen
    const listingCount = await db
      .select({ count: count(listings.id) })
      .from(listings)
      .where(
        and(
          eq(listings.fingerprint, listing.fingerprint),
          gte(listings.publishedAt, thirtyDaysAgo)
        )
      );

    const countValue = listingCount[0]?.count || 0;
    
    // More appearances = higher anomaly score
    if (countValue >= 5) return 1.0;  // Very suspicious
    if (countValue >= 3) return 0.8;  // Anomaly
    if (countValue >= 2) return 0.6;  // Noteworthy
    return 0.5; // Normal
  }

  async findMatchesForProfile(profile: Profile): Promise<ScoredListing[]> {
    // Get recent listings in the profile's city
    const recentListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.city, profile.city),
          gte(listings.lastSeenAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(listings.publishedAt))
      .limit(100);

    const matches: ScoredListing[] = [];

    for (const listing of recentListings) {
      const scored = await this.scoreListing(listing, profile);
      if (scored && scored.isMatch) {
        matches.push(scored);
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  async createMatch(scored: ScoredListing, profileId: string): Promise<void> {
    // Check if match already exists
    const existing = await db
      .select({ id: matches.id })
      .from(matches)
      .where(
        and(
          eq(matches.profileId, profileId),
          eq(matches.listingId, scored.listing.id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return; // Match already exists
    }

    // Create new match
    await db.insert(matches).values({
      profileId,
      listingId: scored.listing.id,
      score: scored.score,
      signals: scored.signals,
      matchedAt: new Date(),
    });
  }

  async processNewListing(listing: Listing): Promise<void> {
    // Get all active profiles for this city
    const activeProfiles = await db
      .select()
      .from(profiles)
      .where(
        and(
          eq(profiles.city, listing.city),
          eq(profiles.status, 'active')
        )
      );

    console.log(`[SKYLINE_SCORE] Processing listing ${listing.id} against ${activeProfiles.length} profiles`);

    for (const profile of activeProfiles) {
      const scored = await this.scoreListing(listing, profile);
      
      if (scored && scored.isMatch) {
        await this.createMatch(scored, profile.id);
        console.log(`[SKYLINE_SCORE] Match found: listing ${listing.id} -> profile ${profile.id} (score: ${scored.score})`);
      }
    }
  }

  setMatchThreshold(threshold: number): void {
    this.matchThreshold = Math.max(0, Math.min(1, threshold));
  }

  getMatchThreshold(): number {
    return this.matchThreshold;
  }

  setWeights(weights: Partial<Record<keyof ScoreSignals, number>>): void {
    this.weights = { ...this.weights, ...weights };
  }

  getWeights(): Record<keyof ScoreSignals, number> {
    return { ...this.weights };
  }
}
