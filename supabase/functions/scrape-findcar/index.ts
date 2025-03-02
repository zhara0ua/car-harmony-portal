
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate a random user agent
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Function to wait for a specified time
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch a URL with retries and wait for content loading
async function fetchWithRetries(url: string, options: any, retries = 3, waitTime = 5000) {
  try {
    console.log(`Fetching ${url} with timeout ${options.timeout}ms`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let html = await response.text();
    console.log(`Received initial HTML (${html.length} bytes)`);
    
    // Wait for some time to allow client-side JS to potentially load data
    await sleep(waitTime);
    
    // Fetch again to see if content is now loaded
    console.log("Fetching again after waiting...");
    const secondResponse = await fetch(url, options);
    if (secondResponse.ok) {
      html = await secondResponse.text();
      console.log(`Received HTML after waiting (${html.length} bytes)`);
    }
    
    return html;
  } catch (error) {
    console.error(`Fetch attempt failed: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      await sleep(2000); // Wait before retrying
      return fetchWithRetries(url, options, retries - 1, waitTime);
    }
    throw error;
  }
}

// Function to extract car details from FindCar HTML
function extractCarsFromHTML(html: string) {
  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    
    if (!document) {
      console.error("Failed to parse HTML");
      return [];
    }
    
    console.log("Parsing HTML document...");
    
    // Look for vehicle cards - adjust selectors based on the actual HTML structure
    const vehicleCards = document.querySelectorAll('.car-item, .vehicle-card, .auction-item, .listing-item');
    console.log(`Found ${vehicleCards.length} vehicle cards`);
    
    if (vehicleCards.length === 0) {
      // If we didn't find any with the expected class, try a more general approach
      console.log("No vehicle cards found with primary selectors, trying alternative selectors...");
      const possibleCards = document.querySelectorAll('[class*="car"], [class*="vehicle"], [class*="product"]');
      console.log(`Found ${possibleCards.length} possible vehicle elements with alternative selectors`);
    }
    
    const cars = [];
    let idCounter = 1;
    
    vehicleCards.forEach((card) => {
      try {
        // Extract various elements - adjust selectors as needed
        const titleElement = card.querySelector('h2, h3, .title, .car-title, [class*="title"]');
        const priceElement = card.querySelector('.price, [class*="price"]');
        const imageElement = card.querySelector('img');
        const detailsElements = card.querySelectorAll('.detail, [class*="detail"], .specs, [class*="specs"], p, .meta-item');
        
        // Extract link
        const linkElement = card.querySelector('a');
        const url = linkElement?.getAttribute('href') || '';
        
        // Process details
        const details = {
          year: '',
          mileage: '',
          engine: '',
          transmission: '',
          fuel: '',
          color: ''
        };
        
        detailsElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          
          if (text.includes('km') || text.includes('mi')) {
            details.mileage = text;
          } else if (/\d{4}/.test(text) && text.length < 10) {
            details.year = text;
          } else if (text.includes('L') || text.includes('cc') || text.includes('engine')) {
            details.engine = text;
          } else if (text.includes('auto') || text.includes('manual') || text.includes('CVT')) {
            details.transmission = text;
          } else if (text.includes('petrol') || text.includes('diesel') || text.includes('electric') || text.includes('hybrid')) {
            details.fuel = text;
          } else if (!details.color && text.length < 20) {
            details.color = text;
          }
        });
        
        // Build the car object
        cars.push({
          id: `car-${idCounter++}`,
          title: titleElement?.textContent?.trim() || 'Unknown Vehicle',
          price: priceElement?.textContent?.trim() || 'Price not available',
          image: imageElement?.getAttribute('src') || '',
          url: url.startsWith('http') ? url : `https://findcar.co${url}`,
          details: details
        });
      } catch (cardError) {
        console.error(`Error processing card: ${cardError.message}`);
      }
    });
    
    return cars;
  } catch (error) {
    console.error(`Error extracting cars: ${error.message}`);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const useRandomUserAgent = requestData.useRandomUserAgent || false;
    const timeout = requestData.timeout || 60000; // Default to 60 seconds
    const waitTime = requestData.waitTime || 5000; // Wait 5 seconds by default for content to load
    
    // Setup fetch options
    const userAgent = useRandomUserAgent ? getRandomUserAgent() : 'Supabase Function Scraper';
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: timeout
    };
    
    console.log(`Starting scrape with timeout: ${timeout}ms, wait time: ${waitTime}ms`);
    
    // Fetch the website content
    const html = await fetchWithRetries('https://findcar.co/used-cars', options, 3, waitTime);
    
    // Extract cars from the HTML
    const cars = extractCarsFromHTML(html);
    
    // Prepare the response
    const result = {
      success: cars.length > 0,
      cars: cars,
      html: html,
      timestamp: new Date().toISOString(),
    };
    
    if (cars.length === 0) {
      result.success = false;
      result.error = "No cars found on the website";
    }
    
    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Scraper error: ${error.message}`);
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: `Scraping failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
