
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
      
      try {
        console.log("Attempting to invoke Edge Function: scrape-openlane");
        const { data, error } = await supabase.functions.invoke('scrape-openlane', {
          body: { 
            useRandomUserAgent: true,
            useProxy: true
          }
        });
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          throw error;
        }
        
        console.log("Received data from Edge Function:", data);
        return data as ScraperResult;
      } catch (functionError) {
        console.error("Failed to call Supabase Edge Function:", functionError);
        
        // In development mode, fallback to mock data
        if (import.meta.env.DEV) {
          console.warn("Using mock data instead of live scraped data");
          return mockScraperResult;
        }
        
        return { 
          success: false, 
          error: functionError instanceof Error ? functionError.message : "Failed to call scraper function",
          timestamp: new Date().toISOString()
        };
      }
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
