
import { scraperService } from './scraper';
import { ScraperResult } from '@/types/scraped-car';

export class ScraperService {
  async scrape(site: string, url: string, useMockData: boolean): Promise<ScraperResult> {
    try {
      const result = await scraperService.scrape(site, {
        url: url || undefined,
        useMockData
      });
      
      return result;
    } catch (error) {
      console.error('Error in ScraperService:', error);
      return {
        success: false,
        cars: [],
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Re-export the scraperService from the new structure
export { scraperService } from './scraper';
export type { ScraperOptions } from './scraper/base-scraper';
