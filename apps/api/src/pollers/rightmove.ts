import { BasePoller, RawListing, PollerConfig } from './base';

interface RightmoveListing {
  id: string;
  title: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  address: {
    displayAddress: string;
    postcode: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  firstVisibleDate: string;
  propertyUrl: string;
}

export class RightmovePoller extends BasePoller {
  private baseUrl: string = 'https://www.rightmove.co.uk';

  constructor(config: PollerConfig) {
    super(config);
  }

  async fetchListings(): Promise<RawListing[]> {
    console.log(`[SKYLINE_INGEST] Fetching Rightmove listings for ${this.config.city}...`);

    try {
      // Note: Rightmove doesn't have a public API
      // This is a placeholder for web scraping implementation
      
      console.log(`[SKYLINE_INGEST] Rightmove poller for ${this.config.city} (web scraping mode)`);
      
      // Mock data for development
      return [
        {
          externalId: `rightmove-${Date.now()}-1`,
          title: `Flat in ${this.config.city}`,
          price: 2500,
          currency: 'GBP',
          sqm: 70,
          bedrooms: 2,
          address: `Example Road 456, ${this.config.city}`,
          latitude: 51.5074,
          longitude: -0.1278,
          publishedAt: new Date(),
          url: `${this.baseUrl}/example`,
        },
      ];
    } catch (error) {
      console.error(`[SKYLINE_INGEST] Rightmove API error for ${this.config.city}:`, error);
      throw error;
    }
  }
}

// Factory function to create London poller
export function createLondonPoller(pollIntervalS: number = 300): RightmovePoller {
  const config: PollerConfig = {
    sourceKey: 'rightmove-london',
    city: 'London',
    pollIntervalS,
  };

  return new RightmovePoller(config);
}
