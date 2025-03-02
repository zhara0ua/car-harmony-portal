
import { supabase } from '@/integrations/supabase/client';
import { ScraperResult } from '@/types/scraped-car';
import { mockScraperResult } from '@/mocks/mockScraperData';

export const scraperService = {
  async scrapeOpenLane(): Promise<ScraperResult> {
    try {
      // Check if supabase is properly initialized
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn("Supabase client is not fully initialized, using mock data");
        return mockScraperResult;
      }
      
      const { data, error } = await supabase.functions.invoke('scrape-openlane', {
        body: { 
          useRandomUserAgent: true,
          useProxy: true
        }
      });
      
      if (error) {
        console.error("Error scraping OpenLane:", error);
        return { 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      return data as ScraperResult;
    } catch (error) {
      console.error("Exception in scrapeOpenLane:", error);
      // Fallback to mock data in development
      if (import.meta.env.DEV) {
        console.warn("Falling back to mock data");
        return mockScraperResult;
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      };
    }
  }
};
