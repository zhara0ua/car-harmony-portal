
import { createClient } from '@supabase/supabase-js';
import { ScraperResult } from '@/types/scraped-car';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const scraperService = {
  async scrapeOpenLane(): Promise<ScraperResult> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-openlane', {
        method: 'POST',
        body: {},
      });

      if (error) {
        console.error('Error scraping OpenLane:', error);
        return {
          success: false,
          error: error.message || 'Failed to scrape OpenLane',
          timestamp: new Date().toISOString()
        };
      }

      return data as ScraperResult;
    } catch (error) {
      console.error('Error in scraperService:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
};
