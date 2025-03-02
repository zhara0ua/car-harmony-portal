
import { ScraperResult } from '@/types/scraped-car';
import { BaseScraper, ScraperOptions } from './base-scraper';

export class OpenLaneScraper extends BaseScraper {
  constructor() {
    // Pass the Edge Function name and the path to mock data
    super('scrape-openlane', '@/services/scraper/mock-data');
  }

  async scrape(options: ScraperOptions = {}): Promise<ScraperResult> {
    return this.invokeScraper({
      ...options,
      waitForSelector: options.waitForSelector || '#react-root .vehicle-card, #react-root .no-results',
      // Add slightly longer default timeout for OpenLane
      timeout: options.timeout || 60000 // 60 seconds default
    });
  }
}
