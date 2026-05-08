import { BasePoller, RawListing, PollerConfig } from './base';

interface ImmoScoutListing {
  id: string;
  title: string;
  address: {
    city: string;
    quarter: string;
    postcode: string;
    street: string;
    houseNumber: string;
    latitude?: number;
    longitude?: number;
  };
  price: {
    value: number;
    currency: string;
    marketingType: string;
    priceIntervalType: string;
  };
  livingSpace: number;
  numberOfRooms: number;
  titlePicture?: {
    url: string;
  };
  publicationDate: string;
  companyLogo?: string;
  company?: string;
  privateOffer: boolean;
}

interface ImmoScoutApiResponse {
  searchResultsModel: {
    resultlist: {
      resultlistEntries: Array<{
        resultlistEntry: ImmoScoutListing[];
      }>;
    };
    pagination: {
      currentPage: number;
      numberOfPages: number;
      numberOfHits: number;
    };
  };
}

export class ImmoScoutPoller extends BasePoller {
  private baseUrl: string = 'https://www.immobilienscout24.de';
  private maxPages: number = 5;

  constructor(config: PollerConfig) {
    super(config);
  }

  async fetchListings(): Promise<RawListing[]> {
    console.log(`[SKYLINE_INGEST] Fetching ImmoScout24 listings for ${this.config.city}...`);

    try {
      const allListings: RawListing[] = [];

      for (let page = 1; page <= this.maxPages; page++) {
        const response = await this.makeApiRequest(page);
        
        if (!response.searchResultsModel?.resultlist?.resultlistEntries) {
          break;
        }

        const entries = response.searchResultsModel.resultlist.resultlistEntries;
        
        for (const entry of entries) {
          if (entry.resultlistEntry) {
            for (const listing of entry.resultlistEntry) {
              allListings.push(this.transformListing(listing));
            }
          }
        }

        // Check if we've reached the last page
        const pagination = response.searchResultsModel.pagination;
        if (page >= pagination.numberOfPages) {
          break;
        }

        // Rate limiting - wait between pages
        if (page < this.maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`[SKYLINE_INGEST] Fetched ${allListings.length} listings from ImmoScout24`);
      return allListings;
    } catch (error) {
      console.error(`[SKYLINE_INGEST] ImmoScout24 API error for ${this.config.city}:`, error);
      throw error;
    }
  }

  private async makeApiRequest(page: number): Promise<ImmoScoutApiResponse> {
    const url = `${this.baseUrl}/de/api/search/DE/resultlist/search`;

    const params = new URLSearchParams({
      geocodes: this.getGeocode(this.config.city),
      numberofrooms: '1.0-',
      livingspace: '20.0-',
      pricetype: 'rentpermonth',
      price: '0.0-',
      sorting: '2', // By date
      pagination: 'true',
      pagenumber: page.toString(),
      size: '25',
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`ImmoScout24 API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getGeocode(city: string): string {
    // Map city names to ImmoScout24 geocodes
    const geocodeMap: Record<string, string> = {
      'berlin': '1276003001', // Berlin
      'munich': '1090000001', // Munich
      'hamburg': '1120000001', // Hamburg
      'frankfurt': '1060000001', // Frankfurt
      'cologne': '1040000001', // Cologne
    };

    return geocodeMap[city.toLowerCase()] || geocodeMap['berlin'];
  }

  private transformListing(item: ImmoScoutListing): RawListing {
    const address = [
      item.address.street,
      item.address.houseNumber,
      item.address.quarter,
      item.address.city,
    ].filter(Boolean).join(', ');

    return {
      externalId: item.id,
      title: item.title,
      price: item.price.value,
      currency: item.price.currency || 'EUR',
      sqm: item.livingSpace,
      bedrooms: item.numberOfRooms,
      address: address,
      latitude: item.address.latitude,
      longitude: item.address.longitude,
      publishedAt: new Date(item.publicationDate),
      url: `${this.baseUrl}/expose/${item.id}`,
    };
  }
}

// Factory function to create Berlin poller
export function createBerlinPoller(pollIntervalS: number = 60): ImmoScoutPoller {
  const config: PollerConfig = {
    sourceKey: 'immobilienscout24-berlin',
    city: 'Berlin',
    pollIntervalS,
  };

  return new ImmoScoutPoller(config);
}
