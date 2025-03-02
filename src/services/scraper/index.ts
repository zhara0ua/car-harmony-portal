
import { OpenLaneScraper } from './openlane-scraper';
import { FindCarScraper } from './findcar-scraper';
import { ScraperOptions } from './base-scraper';
import { ScraperResult } from '@/types/scraped-car';

// Create instances of scrapers
const openLaneScraper = new OpenLaneScraper();
const findCarScraper = new FindCarScraper();

// Export the scraperService with the same API as before
export const scraperService = {
  async scrapeOpenLane(options: ScraperOptions = {}): Promise<ScraperResult> {
    return openLaneScraper.scrape(options);
  },

  async scrapeFindCar(options: ScraperOptions = {}): Promise<ScraperResult> {
    return findCarScraper.scrape(options);
  }
};

// Re-export types
export type { ScraperOptions } from './base-scraper';
