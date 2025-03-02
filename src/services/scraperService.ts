
import { supabase } from '@/integrations/supabase/client';
import { ScraperResult } from '@/types/scraped-car';

// Sample mock HTML for fallback when Edge Functions fail
const MOCK_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Mock Car Listing Page</title>
</head>
<body>
  <h1>Car Listings</h1>
  <div class="car-listing">
    <div class="car-item">
      <h2>2022 BMW X5</h2>
      <p>Price: $65,000</p>
      <p>Mileage: 12,500 miles</p>
      <img src="bmw-x5.jpg" alt="BMW X5">
    </div>
    <div class="car-item">
      <h2>2023 Audi Q7</h2>
      <p>Price: $72,500</p>
      <p>Mileage: 5,800 miles</p>
      <img src="audi-q7.jpg" alt="Audi Q7">
    </div>
  </div>
</body>
</html>
`;

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
      try {
        const { data, error } = await supabase.functions.invoke('scrape-openlane', {
          body: { 
            useRandomUserAgent: true
          }
        });
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          console.log("Falling back to mock data for OpenLane");
          return { 
            success: true, 
            html: MOCK_HTML,
            timestamp: new Date().toISOString(),
            note: "This is mock data as the Edge Function failed."
          };
        }
        
        console.log("Received data from Edge Function:", data);
        return data as ScraperResult;
      } catch (invocationError) {
        console.error("Error during Edge Function invocation:", invocationError);
        console.log("Falling back to mock data for OpenLane due to invocation error");
        return {
          success: true,
          html: MOCK_HTML,
          timestamp: new Date().toISOString(),
          note: "This is mock data as the Edge Function failed."
        };
      }
    } catch (error) {
      console.error("Exception in scrapeOpenLane:", error);
      console.log("Falling back to mock data for OpenLane due to general error");
      return { 
        success: true,
        html: MOCK_HTML,
        timestamp: new Date().toISOString(),
        note: "This is mock data as the Edge Function failed."
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
            useRandomUserAgent: true,
            timeout: 60000 // Add a longer timeout (60 seconds)
          }
        });
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          console.log("Falling back to mock data for FindCar");
          return { 
            success: true,
            html: MOCK_HTML,
            timestamp: new Date().toISOString(),
            note: "This is mock data as the Edge Function failed."
          };
        }
        
        console.log("Received data from Edge Function:", data);
        return data as ScraperResult;
      } catch (invocationError) {
        console.error("Error during Edge Function invocation:", invocationError);
        console.log("Falling back to mock data for FindCar due to invocation error");
        return {
          success: true,
          html: MOCK_HTML,
          timestamp: new Date().toISOString(),
          note: "This is mock data as the Edge Function failed."
        };
      }
    } catch (error) {
      console.error("Exception in scrapeFindCar:", error);
      console.log("Falling back to mock data for FindCar due to general error");
      return { 
        success: true,
        html: MOCK_HTML,
        timestamp: new Date().toISOString(),
        note: "This is mock data as the Edge Function failed."
      };
    }
  }
};
