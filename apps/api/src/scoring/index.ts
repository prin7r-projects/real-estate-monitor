import { db } from '../db';
import { listings, matches, profiles, type Listing, type Profile } from '../db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

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

    return {
      listing,
      score: Math.round(score * 100) / 100,
      signals,
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

  private async calculateCompBaseline(listing: Listing): Promise<{ median: number; mad: number }> {
    // Get 30-day comparable listings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const comps = await db
      .select({
        priceCents: listings.priceCents,
      })
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

    if (comps.length === 0) {
      return { median: listing.priceCents, mad: 0 };
    }

    const prices = comps.map(c => c.priceCents);
    const median = this.calculateMedian(prices);
    const mad = this.calculateMAD(prices, median);

    return { median, mad };
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateMAD(values: number[], median: number): number {
    const deviations = values.map(v => Math.abs(v - median));
    return this.calculateMedian(deviations);
  }

  private calculateResidual(listing: Listing, comp: { median: number; mad: number }): number {
    if (comp.mad === 0) return 0.5;
    
    const residual = (listing.priceCents - comp.median) / comp.mad;
    
    // Negative residual = underpriced = higher score
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, 0.5 - residual * 0.1));
  }

  private async calculateVelocity(listing: Listing): Promise<number> {
    // Check for price cuts in history
    // For now, return a default score
    return 0.5;
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
    
    // Has photos (placeholder)
    score += 0.1;
    
    // Has description (placeholder)
    score += 0.1;
    
    // Has sqm
    if (listing.sqm) score += 0.1;
    
    // Has bedrooms
    if (listing.bedrooms) score += 0.1;
    
    // Has address
    if (listing.addressNorm) score += 0.1;
    
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
    
    // For now, return a default score
    return 0.5;
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
      if (scored && scored.score >= 0.7) { // Threshold for matches
        matches.push(scored);
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }
}
