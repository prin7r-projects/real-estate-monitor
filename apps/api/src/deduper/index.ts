import { createHash } from 'crypto';
import { NormalizedListing } from '../normalizer';

export class Deduper {
  private windowHours: number;

  constructor(windowHours: number = 24) {
    this.windowHours = windowHours;
  }

  generateFingerprint(listing: NormalizedListing): string {
    const normalized = [
      listing.city.toLowerCase(),
      listing.addressNorm.toLowerCase(),
      listing.sqm?.toString() || '',
      listing.bedrooms?.toString() || '',
      Math.round(listing.priceCents * 0.02).toString(), // ±2% price tolerance
      listing.publishedAt.toISOString().split('T')[0], // date only
    ].join('|');

    return createHash('sha256').update(normalized).digest('hex').slice(0, 32);
  }

  isDuplicate(fingerprint: string, recentFingerprints: Set<string>): boolean {
    return recentFingerprints.has(fingerprint);
  }

  calculateSimilarity(a: NormalizedListing, b: NormalizedListing): number {
    let score = 0;
    let factors = 0;

    // City match
    if (a.city.toLowerCase() === b.city.toLowerCase()) {
      score += 1;
    }
    factors += 1;

    // Address similarity
    const addressSimilarity = this.calculateStringSimilarity(
      a.addressNorm.toLowerCase(),
      b.addressNorm.toLowerCase()
    );
    score += addressSimilarity;
    factors += 1;

    // Price similarity (within 2%)
    if (a.priceCents > 0 && b.priceCents > 0) {
      const priceDiff = Math.abs(a.priceCents - b.priceCents) / Math.max(a.priceCents, b.priceCents);
      if (priceDiff <= 0.02) {
        score += 1;
      } else {
        score += Math.max(0, 1 - priceDiff);
      }
    }
    factors += 1;

    // SQM similarity
    if (a.sqm && b.sqm) {
      const sqmDiff = Math.abs(a.sqm - b.sqm) / Math.max(a.sqm, b.sqm);
      if (sqmDiff <= 0.05) {
        score += 1;
      } else {
        score += Math.max(0, 1 - sqmDiff);
      }
    }
    factors += 1;

    // Bedrooms match
    if (a.bedrooms && b.bedrooms) {
      if (a.bedrooms === b.bedrooms) {
        score += 1;
      }
    }
    factors += 1;

    return score / factors;
  }

  private calculateStringSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - matrix[b.length][a.length] / maxLength;
  }
}
