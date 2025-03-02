
import { supabase } from '@/integrations/supabase/client';
import { ScraperResult } from '@/types/scraped-car';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry failed requests
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Retrying operation, ${retries} attempts left...`);
    await delay(RETRY_DELAY);
    return retryOperation(operation, retries - 1);
  }
}

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
      
      // Retry the function invocation
      const { data, error } = await retryOperation(async () => {
        return await supabase.functions.invoke('scrape-openlane', {
          method: 'POST',
          body: { 
            useRandomUserAgent: true,
            useProxy: false,
            timeout: 20000
          }
        });
      });
      
      if (error) {
        console.error("Error from Supabase Edge Function:", error);
        return { 
          success: false, 
          error: error.message || "Failed to call scraper function",
          timestamp: new Date().toISOString()
        };
      }
      
      if (!data) {
        console.error("No data returned from Edge Function");
        return {
          success: false,
          error: "No data returned from scraper function",
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

  async scrapeCarOutlet(): Promise<ScraperResult> {
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
      
      console.log("Attempting to invoke Edge Function: scrape-caroutlet");
      
      // Retry the function invocation
      const { data, error } = await retryOperation(async () => {
        return await supabase.functions.invoke('scrape-caroutlet', {
          method: 'POST',
          body: { 
            useRandomUserAgent: true,
            useProxy: false,
            timeout: 30000
          }
        });
      });
      
      if (error) {
        console.error("Error from Supabase Edge Function:", error);
        return { 
          success: false, 
          error: error.message || "Failed to call scraper function",
          timestamp: new Date().toISOString()
        };
      }
      
      if (!data) {
        console.error("No data returned from Edge Function");
        return {
          success: false,
          error: "No data returned from scraper function",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log("Received data from Edge Function:", data);
      return data as ScraperResult;
    } catch (error) {
      console.error("Exception in scrapeCarOutlet:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      };
    }
  }
};
