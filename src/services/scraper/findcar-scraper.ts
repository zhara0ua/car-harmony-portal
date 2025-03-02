
import { ScraperResult } from '@/types/scraped-car';
import { BaseScraper, ScraperOptions } from './base-scraper';

export class FindCarScraper extends BaseScraper {
  constructor() {
    super('scrape-findcar');
  }

  async scrape(options: ScraperOptions = {}): Promise<ScraperResult> {
    return this.invokeScraper({
      ...options,
      waitForSelector: options.waitForSelector || '.vehicle-card, .no-results'
    });
  }
}
