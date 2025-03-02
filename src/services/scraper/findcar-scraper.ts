
import { ScraperResult } from '@/types/scraped-car';
import { BaseScraper, ScraperOptions } from './base-scraper';

export class FindCarScraper extends BaseScraper {
  constructor() {
    super('scrape-findcar');
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
