
import { ScraperResult } from '@/types/scraped-car';
import mockData, { MOCK_HTML } from './mock-data';

export interface ScraperOptions {
  url?: string;
  waitForSelector?: string;
  timeout?: number;
  useMockData?: boolean;
}

export class BaseScraper {
  protected functionName: string;
  protected mockDataPath: string;

  constructor(functionName: string, mockDataPath: string) {
    this.functionName = functionName;
    this.mockDataPath = mockDataPath;
  }

  protected async invokeScraper(options: ScraperOptions): Promise<ScraperResult> {
    // If useMockData is true, return mock data immediately
    if (options.useMockData) {
      console.log(`Using mock data instead of invoking ${this.functionName}`);
      return {
        cars: mockData,
        message: "Success (using mock data)",
        success: true,
        timestamp: new Date().toISOString()
      };
    }

    try {
      console.log(`Invoking Edge Function: ${this.functionName}`);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${this.functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(options),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(options.timeout || 30000)
      });

      if (!response.ok) {
        console.error(`Error ${response.status} from Edge Function ${this.functionName}: ${response.statusText}`);
        throw new Error(`Edge Function Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to invoke ${this.functionName}:`, error);
      
      // Provide more detailed error message including the error name
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : 'Unknown error';
      
      // Return mock data as fallback with error message
      return {
        cars: mockData,
        message: `Edge Function error: ${errorMessage}. Using mock data as fallback.`,
        success: false,
        timestamp: new Date().toISOString(),
        note: "This is mock data provided as a fallback due to Edge Function errors."
      };
    }
  }
}
