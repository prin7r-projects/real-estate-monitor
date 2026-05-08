import { BasePoller, RawListing, PollerConfig } from './base';

interface SpitogatosListing {
  id: string;
  title: string;
  price: number;
  sqm: number;
  bedrooms: number;
  address: string;
  latitude: number;
  longitude: number;
  publicationDate: string;
  url: string;
}

export class SpitogatosPoller extends BasePoller {
  private baseUrl: string = 'https://www.spitogatos.gr';

  constructor(config: PollerConfig) {
    super(config);
  }

  async fetchListings(): Promise<RawListing[]> {
    console.log(`[SKYLINE_INGEST] Fetching Spitogatos listings for ${this.config.city}...`);

    try {
      // Note: Spitogatos doesn't have a public API
      // This is a placeholder for web scraping implementation
      
      console.log(`[SKYLINE_INGEST] Spitogatos poller for ${this.config.city} (web scraping mode)`);
      
      // Mock data for development
      return [
        {
          externalId: `spitogatos-${Date.now()}-1`,
          title: `Apartment in ${this.config.city}`,
          price: 800,
          currency: 'EUR',
          sqm: 65,
          bedrooms: 2,
          address: `Example Street 789, ${this.config.city}`,
          latitude: 37.9838,
          longitude: 23.7275,
          publishedAt: new Date(),
          url: `${this.baseUrl}/example`,
        },
      ];
    } catch (error) {
      console.error(`[SKYLINE_INGEST] Spitogatos API error for ${this.config.city}:`, error);
      throw error;
    }
  }
}

// Factory function to create Athens poller
export function createAthensPoller(pollIntervalS: number = 300): SpitogatosPoller {
  const config: PollerConfig = {
    sourceKey: 'spitogatos-athens',
    city: 'Athens',
    pollIntervalS,
  };

  return new SpitogatosPoller(config);
}
