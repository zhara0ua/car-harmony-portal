
import { ScraperResult } from '@/types/scraped-car';
import { BaseScraper, ScraperOptions } from './base-scraper';

export class FindCarScraper extends BaseScraper {
  constructor() {
    // Pass the Edge Function name and the path to mock data
    super('scrape-findcar', '@/services/scraper/mock-data');
  }

  async scrape(options: ScraperOptions = {}): Promise<ScraperResult> {
    return this.invokeScraper({
      ...options,
      waitForSelector: options.waitForSelector || '.vehicle-card, .no-results',
      // Add slightly longer default timeout for FindCar
      timeout: options.timeout || 60000 // 60 seconds default
    });
  }
}
