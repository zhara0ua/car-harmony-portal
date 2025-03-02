
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestBody = {
  useRandomUserAgent?: boolean;
  useProxy?: boolean;
  timeout?: number;
};

type ScrapedCarDetails = {
  year?: string;
  mileage?: string;
  engine?: string;
  transmission?: string;
  fuel?: string;
  color?: string;
};

type ScrapedCar = {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  details: ScrapedCarDetails;
};

type ScraperResult = {
  success: boolean;
  cars?: ScrapedCar[];
  html?: string;
  error?: string;
  timestamp: string;
};

// Get random user agent to avoid being blocked
function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeCarOutlet(userAgent: string, timeout: number): Promise<ScraperResult> {
  console.log("Starting to scrape caroutlet.eu");
  try {
    // Create fetch with AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch('https://caroutlet.eu/nl/assortiment/', {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Error fetching website: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Error fetching website: ${response.status} ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    }
    
    const html = await response.text();
    console.log(`Received HTML with length: ${html.length}`);
    
    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    const cars: ScrapedCar[] = [];
    
    // Parsing car listings - adjust selectors based on actual site structure
    $('.car-item, .vehicle-item, .product-item').each((i, el) => {
      try {
        const $element = $(el);
        
        // Extract data with fallbacks for different possible class names
        const title = $element.find('.car-title, .title, h2, h3').first().text().trim();
        const price = $element.find('.price, .car-price').first().text().trim();
        const image = $element.find('img').attr('src') || $element.find('img').attr('data-src') || '';
        const url = $element.find('a').attr('href') || '';
        
        // Extract details from the listing
        const details: ScrapedCarDetails = {
          year: $element.find('.year, .model-year').first().text().trim(),
          mileage: $element.find('.mileage, .km').first().text().trim(),
          engine: $element.find('.engine, .engine-type').first().text().trim(),
          transmission: $element.find('.transmission, .gearbox').first().text().trim(),
          fuel: $element.find('.fuel, .fuel-type').first().text().trim(),
          color: $element.find('.color, .exterior-color').first().text().trim(),
        };
        
        // Only add if we have at least title and price
        if (title && price) {
          cars.push({
            id: `caroutlet-${i}`,
            title,
            price,
            image: image.startsWith('http') ? image : `https://caroutlet.eu${image}`,
            url: url.startsWith('http') ? url : `https://caroutlet.eu${url}`,
            details
          });
        }
      } catch (error) {
        console.error(`Error parsing car item ${i}:`, error);
      }
    });
    
    console.log(`Found ${cars.length} cars`);
    
    if (cars.length === 0) {
      console.log("No cars found, returning HTML for debugging");
      return {
        success: false,
        cars: [],
        html,
        error: "No cars found on the website",
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      cars,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error scraping caroutlet.eu:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const userAgent = body.useRandomUserAgent ? getRandomUserAgent() : 'Mozilla/5.0 (compatible; ScrapeBot/1.0)';
    const timeout = body.timeout || 20000; // Default 20s timeout if not specified
    
    console.log(`Starting scraping with ${timeout}ms timeout`);
    
    const result = await scrapeCarOutlet(userAgent, timeout);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in scrape-caroutlet function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
