
import { supabase } from '@/integrations/supabase/client';
import { ScraperResult } from '@/types/scraped-car';

export interface ScraperOptions {
  timeout?: number;
  useRandomUserAgent?: boolean;
  waitForSelector?: string;
  debug?: boolean;
  useFallback?: boolean; // New option to specifically request fallback mode
}

export class BaseScraper {
  protected functionName: string;
  protected mockDataImportPath: string;

  constructor(functionName: string, mockDataImportPath: string) {
    this.functionName = functionName;
    this.mockDataImportPath = mockDataImportPath;
  }

  protected async invokeScraper(options: ScraperOptions = {}): Promise<ScraperResult> {
    try {
      // Check for fallback mode first
      if (options.useFallback === true) {
        console.log(`Using fallback mode for ${this.functionName}`);
        return this.getFallbackData();
      }

      // Validate Supabase connection
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return this.handleError("Supabase client is not initialized", options);
      }

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("Supabase environment variables are missing");
        return this.handleError("Supabase environment variables are missing. Please check your .env file.", options);
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
        
        // Access the status code safely using type assertion and optional chaining
        // Since TypeScript doesn't recognize 'status' on the type but it may exist at runtime
        const responseStatus = (response as any)?.status ? Number((response as any).status) : undefined;
        
        console.log(`Edge Function response status: ${responseStatus !== undefined ? responseStatus : 'unknown'}`);
        
        if (error) {
          console.error("Error from Supabase Edge Function:", error);
          
          // Check if we have a non-2xx status code
          if (responseStatus !== undefined && (responseStatus < 200 || responseStatus >= 300)) {
            return this.handleError(`Edge Function Error: Edge Function returned a non-2xx status code (${responseStatus})`, options, responseStatus);
          }
          
          return this.handleError(`Edge Function Error: ${error.message || error}`, options);
        }
        
        if (!data) {
          console.error("Edge Function returned no data");
          return this.handleError("Edge Function returned no data", options, responseStatus);
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
          return this.handleError("Network error while connecting to Edge Function. Please check if your Supabase project is running and Edge Functions are deployed.", options);
        }

        return this.handleError(`Edge Function invocation error: ${invocationError.message || "Unknown error"}`, options);
      }
    } catch (error: any) {
      console.error(`Exception in ${this.functionName}:`, error);
      return this.handleError(`General error: ${error.message || "Unknown error"}`, options);
    }
  }

  private async handleError(errorMessage: string, options: ScraperOptions, statusCode?: number): Promise<ScraperResult> {
    // If fallback is enabled or wasn't explicitly disabled, try to use fallback data
    if (options.useFallback !== false) {
      console.log(`Attempting to use fallback data for ${this.functionName} due to error: ${errorMessage}`);
      const fallbackResult = await this.getFallbackData();
      
      // Add error information to the fallback result
      return {
        ...fallbackResult,
        note: `Using mock data because: ${errorMessage}`,
        statusCode
      };
    }
    
    // Return the error if fallback is disabled
    return { 
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      note: "An error occurred while trying to scrape data. Enable fallback mode to use mock data.",
      statusCode
    };
  }

  private async getFallbackData(): Promise<ScraperResult> {
    try {
      // Dynamically import the mock data
      const module = await import(this.mockDataImportPath);
      const mockData = module.default || module;
      
      console.log(`Using mock data for ${this.functionName}`);
      
      return {
        success: true,
        cars: mockData.cars || [],
        timestamp: new Date().toISOString(),
        note: "Using mock data because Edge Functions are not available. To use real data, please deploy the Edge Functions."
      };
    } catch (error) {
      console.error(`Error loading mock data for ${this.functionName}:`, error);
      return {
        success: false,
        error: `Failed to load mock data: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
