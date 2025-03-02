
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { v4 as uuidv4 } from "https://deno.land/std@0.97.0/uuid/mod.ts";

// List of user agents to rotate through
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:95.0) Gecko/20100101 Firefox/95.0",
];

// Parse the proxy list from environment variable
let PROXY_LIST: string[] = [];
try {
  const proxyListEnv = Deno.env.get("PROXY_LIST");
  if (proxyListEnv) {
    // Assuming proxy list is comma-separated
    PROXY_LIST = proxyListEnv.split(",").map(proxy => proxy.trim());
  }
} catch (error) {
  console.error("Error parsing proxy list:", error);
}

// Helper function to get a random item from an array
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

serve(async (req) => {
  try {
    // Parse request
    const requestOptions = req.body ? await req.json() : {};
    console.log("Request options:", requestOptions);
    
    // Select random user agent and proxy
    const userAgent = getRandomItem(USER_AGENTS);
    const proxy = PROXY_LIST.length > 0 ? getRandomItem(PROXY_LIST) : null;
    
    console.log(`Using User-Agent: ${userAgent}`);
    console.log(`Using Proxy: ${proxy || 'none'}`);

    // Launch browser with puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        proxy ? `--proxy-server=${proxy}` : '',
      ].filter(Boolean),
    });

    try {
      // Open a new page
      const page = await browser.newPage();
      
      // Set user agent
      await page.setUserAgent(userAgent);
      
      // Set additional headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      });

      // Enable JavaScript
      await page.setJavaScriptEnabled(true);
      
      // Set viewport
      await page.setViewport({
        width: 1920,
        height: 1080,
      });

      // Navigate to the target URL
      await page.goto('https://www.openlane.eu/en/findcar', {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Wait for the content to load (adjust the selector as needed)
      await page.waitForSelector('.search-results', { timeout: 60000 }).catch(() => {
        console.log('Could not find .search-results selector, continuing anyway');
      });

      // Add a delay to let any dynamic content load
      await page.waitForTimeout(5000);

      // Capture the HTML content
      const html = await page.content();

      // Extract car listings
      const cars = await page.evaluate(() => {
        const carElements = Array.from(document.querySelectorAll('.card'));
        return carElements.map(car => {
          // Find elements within each car card
          const titleElement = car.querySelector('.card-title');
          const priceElement = car.querySelector('.card-price');
          const imageElement = car.querySelector('img');
          const linkElement = car.querySelector('a');
          
          // Extract details list items if they exist
          const detailElements = car.querySelectorAll('.card-details li');
          const details = {};
          
          detailElements.forEach(detail => {
            const text = detail.textContent?.trim() || '';
            
            // Try to parse different types of details
            if (text.includes('km')) {
              details.mileage = text;
            } else if (text.includes('L') || text.match(/\d+\s*cc/i)) {
              details.engine = text;
            } else if (text.match(/\b(manual|automatic)\b/i)) {
              details.transmission = text;
            } else if (text.match(/\b(petrol|diesel|electric|hybrid)\b/i)) {
              details.fuel = text;
            } else if (text.match(/\b(20\d\d|19\d\d)\b/)) {
              details.year = text;
            } else {
              // Might be color or another attribute
              details.color = text;
            }
          });
          
          return {
            id: uuidv4(),
            title: titleElement?.textContent?.trim() || 'Unknown Car',
            price: priceElement?.textContent?.trim() || 'Price on request',
            image: imageElement?.src || '',
            url: linkElement?.href || '',
            details,
          };
        });
      });

      await browser.close();

      // Return the scraped data
      return new Response(JSON.stringify({
        success: true,
        cars,
        html,
        timestamp: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error("Error in scraping function:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
