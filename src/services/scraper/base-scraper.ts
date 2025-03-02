
import { supabase } from '@/integrations/supabase/client';
import { ScraperResult } from '@/types/scraped-car';

export interface ScraperOptions {
  timeout?: number;
  useRandomUserAgent?: boolean;
  waitForSelector?: string;
  debug?: boolean;
}

export class BaseScraper {
  protected functionName: string;

  constructor(functionName: string) {
    this.functionName = functionName;
  }

  protected async invokeScraper(options: ScraperOptions = {}): Promise<ScraperResult> {
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
      
      console.log(`Attempting to invoke Edge Function: ${this.functionName} with timeout: ${options.timeout}ms`);
      
      try {
        const startTime = Date.now();
        const response = await supabase.functions.invoke(this.functionName, {
          body: { 
            useRandomUserAgent: options.useRandomUserAgent ?? true,
            timeout: options.timeout ?? 60000, // Default 60 seconds if not specified
            waitForSelector: options.waitForSelector,
            debug: options.debug ?? true // Enable debug mode to get more logs from the Edge Function
          }
        });
        
        const { data, error } = response;
        const endTime = Date.now();
        
        // Access the status code safely - it might be available in some implementations
        // but not in the TypeScript type definition
        const responseStatus = response.status ? Number(response.status) : undefined;
        
        console.log(`Edge Function response status: ${responseStatus || 'unknown'}`);
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          
          // Check if we have a non-2xx status code
          if (responseStatus !== undefined && (responseStatus < 200 || responseStatus >= 300)) {
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
      console.error(`Exception in ${this.functionName}:`, error);
      return { 
        success: false,
        error: `General error: ${error.message || "Unknown error"}`,
        timestamp: new Date().toISOString(),
        note: "An unexpected error occurred while trying to scrape data."
      };
    }
  }
}
