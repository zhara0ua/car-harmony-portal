
import { scraperService } from './scraper';
import { ScraperResult } from '@/types/scraped-car';

export class ScraperService {
  async scrape(site: string, url: string, useMockData: boolean): Promise<ScraperResult> {
    try {
      let result: ScraperResult;
      
      // Call the appropriate scraper method based on the site
      if (site === 'openlane') {
        result = await scraperService.scrapeOpenLane({
          url: url || undefined,
          useMockData
        });
      } else if (site === 'findcar') {
        result = await scraperService.scrapeFindCar({
          url: url || undefined,
          useMockData
        });
      } else {
        throw new Error(`Unknown site: ${site}`);
      }
      
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
