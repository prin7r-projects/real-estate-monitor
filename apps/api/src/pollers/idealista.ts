import { BasePoller, RawListing, PollerConfig } from './base';

interface IdealistaListing {
  propertyCode: string;
  thumbnail: string;
  externalReference: string;
  numPhotos: number;
  floor: string;
  price: number;
  propertyType: string;
  operation: string;
  size: number;
  exterior: boolean;
  rooms: number;
  bathrooms: number;
  address: string;
  province: string;
  municipality: string;
  district: string;
  country: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  showAddress: boolean;
  url: string;
  distance: string;
  description: string;
  hasVideo: boolean;
  has3DTour: boolean;
  has360: boolean;
  hasPlan: boolean;
  hasVirtualTour: boolean;
  newDevelopment: boolean;
  parkingSpace?: {
    hasParkingSpace: boolean;
    isParkingSpaceIncludedInPrice: boolean;
    parkingSpacePrice?: number;
  };
  detailedType?: {
    typology: string;
    subTypology: string;
  };
  suggestedTexts?: {
    subtitle: string;
    title: string;
  };
  hasLift?: boolean;
  priceInfo?: {
    price?: {
      amount: number;
      currencySuffix: string;
    };
  };
}

interface IdealistaApiResponse {
  elementList: IdealistaListing[];
  numPages: number;
  total: number;
  actualPage: number;
  itemsPerPage: number;
}

export class IdealistaPoller extends BasePoller {
  private apiKey: string;
  private baseUrl: string = 'https://api.idealista.com/3.5';
  private country: string;
  private center?: { lat: number; lng: number };
  private maxItems: number = 50;
  private numPage: number = 1;

  constructor(
    config: PollerConfig,
    apiKey: string,
    options?: {
      country?: string;
      center?: { lat: number; lng: number };
      maxItems?: number;
    }
  ) {
    super(config);
    this.apiKey = apiKey;
    this.country = options?.country || 'pt'; // Portugal default for Lisbon
    this.center = options?.center;
    this.maxItems = options?.maxItems || 50;
  }

  async fetchListings(): Promise<RawListing[]> {
    console.log(`[SKYLINE_INGEST] Fetching Idealista listings for ${this.config.city}...`);

    try {
      const response = await this.makeApiRequest();
      
      return response.elementList.map((item) => this.transformListing(item));
    } catch (error) {
      console.error(`[SKYLINE_INGEST] Idealista API error for ${this.config.city}:`, error);
      throw error;
    }
  }

  private async makeApiRequest(): Promise<IdealistaApiResponse> {
    const url = `${this.baseUrl}/listings`;

    const params = new URLSearchParams({
      operation: this.config.city.toLowerCase().includes('rent') ? 'rent' : 'sale',
      propertyType: 'homes',
      locationId: this.getLocationId(this.config.city),
      maxItems: this.maxItems.toString(),
      numPage: this.numPage.toString(),
      order: 'publicationDate',
      sort: 'desc',
    });

    if (this.center) {
      params.append('center', `${this.center.lat},${this.center.lng}`);
      params.append('distance', '5000'); // 5km radius
    }

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Idealista API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getLocationId(city: string): string {
    // Map city names to Idealista location IDs
    const locationMap: Record<string, string> = {
      'lisbon': '0-EU-PT-11-01-001-067-0-000-0', // Lisbon
      'madrid': '0-EU-ES-28-07-001-079-0-000-0', // Madrid
      'barcelona': '0-EU-ES-08-01-001-019-0-000-0', // Barcelona
      'valencia': '0-EU-ES-46-01-001-250-0-000-0', // Valencia
      'porto': '0-EU-PT-13-02-001-001-0-000-0', // Porto
    };

    return locationMap[city.toLowerCase()] || locationMap['lisbon'];
  }

  private transformListing(item: IdealistaListing): RawListing {
    return {
      externalId: item.propertyCode,
      title: item.suggestedTexts?.title || `${item.propertyType} in ${item.municipality}`,
      price: item.price,
      currency: 'EUR',
      sqm: item.size,
      bedrooms: item.rooms,
      address: item.address || `${item.district}, ${item.municipality}`,
      latitude: item.latitude,
      longitude: item.longitude,
      publishedAt: new Date(), // Idealista doesn't provide exact publish date in API
      url: `https://idealista.com${item.url}`,
    };
  }
}

// Factory function to create pollers for different cities
export function createIdealistaPoller(
  city: string,
  apiKey: string,
  options?: {
    country?: string;
    center?: { lat: number; lng: number };
    pollIntervalS?: number;
  }
): IdealistaPoller {
  const config: PollerConfig = {
    sourceKey: `idealista-${city.toLowerCase()}`,
    city,
    pollIntervalS: options?.pollIntervalS || 60, // 60 seconds for hot sources
  };

  return new IdealistaPoller(config, apiKey, {
    country: options?.country,
    center: options?.center,
  });
}

// Pre-configured pollers for Phase 2 cities
export function createLisbonPoller(apiKey: string): IdealistaPoller {
  return createIdealistaPoller('Lisbon', apiKey, {
    country: 'pt',
    center: { lat: 38.7223, lng: -9.1393 }, // Lisbon center
    pollIntervalS: 60,
  });
}

export function createMadridPoller(apiKey: string): IdealistaPoller {
  return createIdealistaPoller('Madrid', apiKey, {
    country: 'es',
    center: { lat: 40.4168, lng: -3.7038 }, // Madrid center
    pollIntervalS: 60,
  });
}
