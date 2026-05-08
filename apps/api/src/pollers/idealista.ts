import { BasePoller, RawListing, PollerConfig } from './base';

export class IdealistaPoller extends BasePoller {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: PollerConfig, apiKey: string) {
    super(config);
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.idealista.com/3.5';
  }

  async fetchListings(): Promise<RawListing[]> {
    // TODO: Implement actual Idealista API integration
    // This is a placeholder that returns mock data for development
    
    console.log(`[SKYLINE_INGEST] Idealista poller for ${this.config.city} (mock mode)`);
    
    // Mock data for development
    return [
      {
        externalId: `idealista-${Date.now()}-1`,
        title: `Modern apartment in ${this.config.city}`,
        price: 1500,
        currency: 'EUR',
        sqm: 75,
        bedrooms: 2,
        address: `Rua Example 123, ${this.config.city}`,
        latitude: 38.7223,
        longitude: -9.1393,
        publishedAt: new Date(),
        url: 'https://idealista.com/example',
      },
    ];
  }
}

// Factory function to create pollers for different cities
export function createIdealistaPoller(city: string, apiKey: string): IdealistaPoller {
  const config: PollerConfig = {
    sourceKey: `idealista-${city.toLowerCase()}`,
    city,
    pollIntervalS: 60, // 60 seconds for hot sources
  };

  return new IdealistaPoller(config, apiKey);
}
