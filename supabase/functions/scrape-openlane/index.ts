
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FirecrawlResponse {
  success: boolean;
  error?: string;
  status?: string;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  data?: any[];
}

interface ScrapedCar {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  details: {
    year?: string;
    mileage?: string;
    engine?: string;
    transmission?: string;
    fuel?: string;
    color?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Firecrawl API key from environment variable
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY is not set');
      throw new Error('Firecrawl API key is not configured');
    }

    // Parse request options
    const { useRandomUserAgent, useProxy } = await req.json();
    console.log("Request options:", { useRandomUserAgent, useProxy });

    // The URL we want to scrape
    const targetUrl = 'https://www.openlane.eu/en/findcar';
    
    console.log(`Starting scrape for ${targetUrl} with Firecrawl API`);
    
    // Make the request to Firecrawl API
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Configure scrape options
    const scrapeOptions = {
      url: targetUrl,
      limit: 10,
      scrapeOptions: {
        waitForSelector: '.car-card, .vehicle-listing, .listing-item', // Common selectors for car listings
        formats: ['html'],
        // If we need to extract specific data
        selectors: [
          { name: 'cars', selector: '.vehicle-listing, .car-card, .listing-item', type: 'list', 
            attributes: [
              { name: 'title', selector: 'h2, h3, .title', type: 'text' },
              { name: 'price', selector: '.price', type: 'text' },
              { name: 'image', selector: 'img', type: 'attribute', attribute: 'src' },
              { name: 'url', selector: 'a', type: 'attribute', attribute: 'href' },
              { name: 'details', selector: '.details, .specs', type: 'html' }
            ]
          }
        ]
      }
    };
    
    // Add proxy if requested
    if (useProxy) {
      const proxyList = Deno.env.get('PROXY_LIST');
      if (proxyList) {
        try {
          const proxies = JSON.parse(proxyList);
          if (proxies.length > 0) {
            const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
            scrapeOptions.scrapeOptions.proxy = randomProxy;
            console.log("Using proxy:", randomProxy);
          }
        } catch (e) {
          console.error("Error parsing proxy list:", e);
        }
      }
    }

    // Add random user agent if requested
    if (useRandomUserAgent) {
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
      ];
      scrapeOptions.scrapeOptions.userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      console.log("Using random user agent:", scrapeOptions.scrapeOptions.userAgent);
    }

    console.log("Making request to Firecrawl API with options:", JSON.stringify(scrapeOptions));
    
    // Make the request to the Firecrawl API
    const response = await fetch('https://api.firecrawl.dev/crawl', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(scrapeOptions)
    });

    // Parse the response
    const firecrawlResponse: FirecrawlResponse = await response.json();
    
    if (!firecrawlResponse.success) {
      console.error("Firecrawl API error:", firecrawlResponse.error);
      throw new Error(firecrawlResponse.error || 'Failed to scrape website');
    }
    
    console.log("Firecrawl response status:", firecrawlResponse.status);
    console.log("Credits used:", firecrawlResponse.creditsUsed);
    
    // Extract cars data from the response
    const cars: ScrapedCar[] = [];
    let html = '';
    
    if (firecrawlResponse.data && firecrawlResponse.data.length > 0) {
      const pageData = firecrawlResponse.data[0];
      
      // If we have the html content, save it
      if (pageData.html) {
        html = pageData.html;
      }
      
      // If we have extracted cars data
      if (pageData.cars && Array.isArray(pageData.cars)) {
        pageData.cars.forEach((carData, index) => {
          const car: ScrapedCar = {
            id: `firecrawl-${index + 1}`,
            title: carData.title || 'Unknown Vehicle',
            price: carData.price || 'Price not available',
            image: carData.image || '',
            url: carData.url || targetUrl,
            details: {}
          };
          
          // Try to extract details from HTML if available
          if (carData.details) {
            // Basic extraction of common car details
            const details = carData.details.toLowerCase();
            
            if (details.includes('year') || details.match(/\b20\d{2}\b/)) {
              const yearMatch = details.match(/\b(20\d{2}|19\d{2})\b/);
              car.details.year = yearMatch ? yearMatch[0] : undefined;
            }
            
            if (details.includes('km') || details.includes('miles')) {
              const mileageMatch = details.match(/\b\d{1,3}(,\d{3})*(\.\d+)?\s*(km|kilometers|miles|mi)\b/i);
              car.details.mileage = mileageMatch ? mileageMatch[0] : undefined;
            }
            
            if (details.includes('engine')) {
              const engineMatch = details.match(/\b\d\.\d[L]?\s*(litre|liter|l)?\s*(v\d|cylinder)?\b/i);
              car.details.engine = engineMatch ? engineMatch[0] : undefined;
            }
            
            if (details.includes('transmission') || details.includes('auto') || details.includes('manual')) {
              if (details.includes('automatic') || details.includes('auto')) {
                car.details.transmission = 'Automatic';
              } else if (details.includes('manual')) {
                car.details.transmission = 'Manual';
              }
            }
            
            if (details.includes('fuel') || details.includes('diesel') || details.includes('petrol') || details.includes('gasoline')) {
              if (details.includes('diesel')) {
                car.details.fuel = 'Diesel';
              } else if (details.includes('petrol') || details.includes('gasoline')) {
                car.details.fuel = 'Petrol';
              } else if (details.includes('electric')) {
                car.details.fuel = 'Electric';
              } else if (details.includes('hybrid')) {
                car.details.fuel = 'Hybrid';
              }
            }
            
            // Colors
            const commonColors = ['black', 'white', 'silver', 'gray', 'grey', 'red', 'blue', 'green', 'yellow', 'brown'];
            for (const color of commonColors) {
              if (details.includes(color)) {
                car.details.color = color.charAt(0).toUpperCase() + color.slice(1);
                break;
              }
            }
          }
          
          cars.push(car);
        });
      }
    }
    
    // If no cars found or if we need fallback data
    if (cars.length === 0) {
      console.log("No cars found in scraped data, attempting to extract from HTML");
      
      // Here we could implement additional parsing logic to extract car data from HTML
      // But for simplicity, we'll just return an empty array
    }
    
    // Create the response object
    const scraperResult = {
      success: true,
      cars: cars,
      html: html,
      timestamp: new Date().toISOString()
    };

    // Return the response
    return new Response(
      JSON.stringify(scraperResult),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in scrape-openlane function:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 500
      }
    );
  }
});
