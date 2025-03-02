
import { supabase } from '@/integrations/supabase/client';
import { ScraperResult } from '@/types/scraped-car';

export const scraperService = {
  async scrapeOpenLane(): Promise<ScraperResult> {
    try {
      // Check if supabase is properly initialized
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("Supabase client is not fully initialized");
        return { 
          success: false, 
          error: "Supabase client is not initialized",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log("Attempting to invoke Edge Function: scrape-openlane");
      const { data, error } = await supabase.functions.invoke('scrape-openlane', {
        body: { 
          useRandomUserAgent: true
        }
      });
      
      if (error) {
        console.error("Error from Supabase Edge Function:", error);
        return { 
          success: false, 
          error: error.message || "Failed to call scraper function",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log("Received data from Edge Function:", data);
      return data as ScraperResult;
    } catch (error) {
      console.error("Exception in scrapeOpenLane:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      };
    }
  },

  async scrapeFindCar(): Promise<ScraperResult> {
    try {
      // Check if supabase is properly initialized
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("Supabase client is not fully initialized");
        return { 
          success: false, 
          error: "Supabase client is not initialized",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log("Attempting to invoke Edge Function: scrape-findcar");
      console.log("Supabase URL and key available:", !!import.meta.env.VITE_SUPABASE_URL, !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      try {
        const { data, error } = await supabase.functions.invoke('scrape-findcar', {
          body: { 
            useRandomUserAgent: true
          }
        });
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          return { 
            success: false, 
            error: `Failed to call scraper function: ${error.message}`,
            timestamp: new Date().toISOString()
          };
        }
        
        console.log("Received data from Edge Function:", data);
        return data as ScraperResult;
      } catch (invocationError) {
        console.error("Error during Edge Function invocation:", invocationError);
        return {
          success: false,
          error: `Edge Function invocation error: ${invocationError instanceof Error ? invocationError.message : "Network or connection error"}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Exception in scrapeFindCar:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      };
    }
  }
};
