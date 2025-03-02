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

interface ScraperOptions {
  timeout?: number;
  useRandomUserAgent?: boolean;
}

export const scraperService = {
  async scrapeOpenLane(options: ScraperOptions = {}): Promise<ScraperResult> {
    try {
      // Validate Supabase connection
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return { 
          success: false, 
          error: "Supabase client is not initialized",
          timestamp: new Date().toISOString()
        };
      }

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("Supabase environment variables are missing");
        return { 
          success: false, 
          error: "Supabase environment variables are missing. Please check your .env file.",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`Attempting to invoke Edge Function: scrape-openlane with timeout: ${options.timeout}ms`);
      console.log(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL.substring(0, 10)}... (truncated for security)`);
      
      try {
        const startTime = Date.now();
        const response = await supabase.functions.invoke('scrape-openlane', {
          body: { 
            useRandomUserAgent: options.useRandomUserAgent ?? true,
            timeout: options.timeout ?? 60000, // Default 60 seconds if not specified
            waitForSelector: '#react-root .vehicle-card, #react-root .no-results',
            debug: true // Enable debug mode to get more logs from the Edge Function
          }
        });
        
        const { data, error } = response;
        // Get status from response object safely
        const responseStatus = 'status' in response ? response.status : undefined;
        const endTime = Date.now();
        
        console.log(`Edge Function response status: ${responseStatus}`);
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          
          // Check if we have a non-2xx status code
          if (responseStatus && (responseStatus < 200 || responseStatus >= 300)) {
            return { 
              success: false, 
              error: `Edge Function Error: Edge Function returned a non-2xx status code (${responseStatus})`,
              statusCode: responseStatus,
              timestamp: new Date().toISOString(),
              note: "The Edge Function returned an error status code. Please check the Supabase Edge Function logs for more details."
            };
          }
          
          return { 
            success: false, 
            error: `Edge Function Error: ${error.message || error}`,
            timestamp: new Date().toISOString(),
            note: "Edge Function encountered an error. Please check the Supabase Edge Function logs."
          };
        }
        
        if (!data) {
          console.error("Edge Function returned no data");
          return {
            success: false,
            error: "Edge Function returned no data",
            statusCode: responseStatus,
            timestamp: new Date().toISOString(),
            note: "The Edge Function executed but returned no data. Please check the Supabase Edge Function logs."
          };
        }
        
        console.log(`Received data from Edge Function in ${endTime - startTime}ms:`, 
          data.cars ? `Found ${data.cars.length} cars` : "No cars found");
        
        return data as ScraperResult;
      } catch (invocationError: any) {
        console.error("Error during Edge Function invocation:", invocationError);
        
        // Determine if this is a network error
        const isNetworkError = invocationError.message && (
          invocationError.message.includes("Failed to fetch") ||
          invocationError.message.includes("Network Error") ||
          invocationError.message.includes("NetworkError")
        );
        
        if (isNetworkError) {
          return {
            success: false,
            error: "Network error while connecting to Edge Function. Please check if your Supabase project is running and Edge Functions are deployed.",
            timestamp: new Date().toISOString(),
            note: "This might be due to Supabase Edge Functions not being deployed or network connectivity issues."
          };
        }

        return {
          success: false,
          error: `Edge Function invocation error: ${invocationError.message || "Unknown error"}`,
          timestamp: new Date().toISOString(),
          note: "Failed to invoke the Edge Function. This might be due to Supabase Edge Functions not being deployed properly."
        };
      }
    } catch (error: any) {
      console.error("Exception in scrapeOpenLane:", error);
      return { 
        success: false,
        error: `General error: ${error.message || "Unknown error"}`,
        timestamp: new Date().toISOString(),
        note: "An unexpected error occurred while trying to scrape data."
      };
    }
  },

  async scrapeFindCar(options: ScraperOptions = {}): Promise<ScraperResult> {
    try {
      // Validate Supabase connection
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return { 
          success: false, 
          error: "Supabase client is not initialized",
          timestamp: new Date().toISOString()
        };
      }

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("Supabase environment variables are missing");
        return { 
          success: false, 
          error: "Supabase environment variables are missing. Please check your .env file.",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`Attempting to invoke Edge Function: scrape-findcar with timeout: ${options.timeout}ms`);
      console.log(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL.substring(0, 10)}... (truncated for security)`);
      
      try {
        const startTime = Date.now();
        const response = await supabase.functions.invoke('scrape-findcar', {
          body: { 
            useRandomUserAgent: options.useRandomUserAgent ?? true,
            timeout: options.timeout ?? 60000, // Default 60 seconds if not specified
            waitForSelector: '.vehicle-card, .no-results',
            debug: true // Enable debug mode to get more logs from the Edge Function
          }
        });
        
        const { data, error } = response;
        // Get status from response object safely
        const responseStatus = 'status' in response ? response.status : undefined;
        const endTime = Date.now();
        
        console.log(`Edge Function response status: ${responseStatus}`);
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          
          // Check if we have a non-2xx status code
          if (responseStatus && (responseStatus < 200 || responseStatus >= 300)) {
            return { 
              success: false, 
              error: `Edge Function Error: Edge Function returned a non-2xx status code (${responseStatus})`,
              statusCode: responseStatus,
              timestamp: new Date().toISOString(),
              note: "The Edge Function returned an error status code. Please check the Supabase Edge Function logs for more details."
            };
          }
          
          return { 
            success: false, 
            error: `Edge Function Error: ${error.message || error}`,
            timestamp: new Date().toISOString(),
            note: "Edge Function encountered an error. Please check the Supabase Edge Function logs."
          };
        }
        
        if (!data) {
          console.error("Edge Function returned no data");
          return {
            success: false,
            error: "Edge Function returned no data",
            statusCode: responseStatus,
            timestamp: new Date().toISOString(),
            note: "The Edge Function executed but returned no data. Please check the Supabase Edge Function logs."
          };
        }
        
        console.log(`Received data from Edge Function in ${endTime - startTime}ms:`, 
          data.cars ? `Found ${data.cars.length} cars` : "No cars found");
        
        return data as ScraperResult;
      } catch (invocationError: any) {
        console.error("Error during Edge Function invocation:", invocationError);
        
        // Determine if this is a network error
        const isNetworkError = invocationError.message && (
          invocationError.message.includes("Failed to fetch") ||
          invocationError.message.includes("Network Error") ||
          invocationError.message.includes("NetworkError")
        );
        
        if (isNetworkError) {
          return {
            success: false,
            error: "Network error while connecting to Edge Function. Please check if your Supabase project is running and Edge Functions are deployed.",
            timestamp: new Date().toISOString(),
            note: "This might be due to Supabase Edge Functions not being deployed or network connectivity issues."
          };
        }

        return {
          success: false,
          error: `Edge Function invocation error: ${invocationError.message || "Unknown error"}`,
          timestamp: new Date().toISOString(),
          note: "Failed to invoke the Edge Function. This might be due to Supabase Edge Functions not being deployed properly."
        };
      }
    } catch (error: any) {
      console.error("Exception in scrapeFindCar:", error);
      return { 
        success: false,
        error: `General error: ${error.message || "Unknown error"}`,
        timestamp: new Date().toISOString(),
        note: "An unexpected error occurred while trying to scrape data."
      };
    }
  }
};
