import { RawListing } from '../pollers/base';

export interface NormalizedListing {
  sourceKey: string;
  city: string;
  side: 'rent' | 'sale';
  priceCents: number;
  sqm?: number;
  bedrooms?: number;
  addressNorm: string;
  latitude?: number;
  longitude?: number;
  publishedAt: Date;
  fingerprint: string;
}

export class Normalizer {
  private city: string;
  private sourceKey: string;

  constructor(city: string, sourceKey: string) {
    this.city = city;
    this.sourceKey = sourceKey;
  }

  normalize(raw: RawListing): NormalizedListing {
    return {
      sourceKey: this.sourceKey,
      city: this.city,
      side: this.detectSide(raw.title),
      priceCents: this.normalizePrice(raw.price, raw.currency),
      sqm: raw.sqm,
      bedrooms: raw.bedrooms,
      addressNorm: this.normalizeAddress(raw.address),
      latitude: raw.latitude,
      longitude: raw.longitude,
      publishedAt: raw.publishedAt,
      fingerprint: '', // Will be set by deduper
    };
  }

  private detectSide(title: string): 'rent' | 'sale' {
    const lowerTitle = title.toLowerCase();
    const rentKeywords = ['rent', 'aluguel', 'alquiler', 'miete', 'louer'];
    const saleKeywords = ['sale', 'venda', 'venta', 'verkauf', 'vente'];

    for (const keyword of rentKeywords) {
      if (lowerTitle.includes(keyword)) return 'rent';
    }
    for (const keyword of saleKeywords) {
      if (lowerTitle.includes(keyword)) return 'sale';
    }

    // Default to rent if unclear
    return 'rent';
  }

  private normalizePrice(price: number, currency: string): number {
    // Convert to cents
    const cents = Math.round(price * 100);

    // TODO: Add currency conversion if needed
    // For now, assume EUR
    return cents;
  }

  private normalizeAddress(address: string): string {
    return address
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s,.-]/g, '')
      .toLowerCase();
  }
}
