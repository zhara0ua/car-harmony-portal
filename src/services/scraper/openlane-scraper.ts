
import { ScraperResult } from '@/types/scraped-car';
import { BaseScraper, ScraperOptions } from './base-scraper';

export class OpenLaneScraper extends BaseScraper {
  constructor() {
    super('scrape-openlane');
  }

  async scrape(options: ScraperOptions = {}): Promise<ScraperResult> {
    return this.invokeScraper({
      ...options,
      waitForSelector: options.waitForSelector || '#react-root .vehicle-card, #react-root .no-results'
    });
  }
}
