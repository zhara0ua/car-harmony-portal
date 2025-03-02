
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12';
import * as UserAgent from 'https://esm.sh/user-agents@1.0.1014';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

const getRandomUserAgent = () => {
  return new UserAgent().toString();
};

async function scrapeOpenLane() {
  console.log('Starting OpenLane scraper');
  
  try {
    // Scrape the main auction page
    const targetUrl = 'https://www.openlane.eu/en/findcar';
    
    const userAgent = getRandomUserAgent();
    console.log(`Using user agent: ${userAgent}`);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenLane: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML content of length: ${html.length}`);
    
    // Parse HTML with cheerio
    const $ = load(html);
    const cars = [];
    let carId = 1;
    
    // Depending on the actual HTML structure of OpenLane, adjust these selectors
    $('.vehicle-item, .car-item, .listing-item').each((i, element) => {
      try {
        const $el = $(element);
        
        // Extract data using proper selectors (these should be adjusted based on actual site structure)
        const title = $el.find('.vehicle-title, .title, h3').first().text().trim();
        const price = $el.find('.price, .vehicle-price').first().text().trim();
        const imageEl = $el.find('img').first();
        const image = imageEl.attr('src') || imageEl.attr('data-src') || '';
        const linkEl = $el.find('a').first();
        const relativeUrl = linkEl.attr('href') || '';
        const url = relativeUrl.startsWith('http') ? relativeUrl : `https://www.openlane.eu${relativeUrl}`;
        
        // Extract details
        const yearEl = $el.find('.year, .vehicle-year');
        const mileageEl = $el.find('.mileage, .vehicle-mileage');
        const engineEl = $el.find('.engine, .vehicle-engine');
        const transmissionEl = $el.find('.transmission, .vehicle-transmission');
        const fuelEl = $el.find('.fuel, .vehicle-fuel');
        const colorEl = $el.find('.color, .vehicle-color');
        
        const car = {
          id: `${carId++}`,
          title: title || 'Unknown Model',
          price: price || 'Price on request',
          image: image || 'https://via.placeholder.com/300x200?text=No+Image',
          url,
          details: {
            year: yearEl.text().trim() || 'N/A',
            mileage: mileageEl.text().trim() || 'N/A',
            engine: engineEl.text().trim() || 'N/A',
            transmission: transmissionEl.text().trim() || 'N/A',
            fuel: fuelEl.text().trim() || 'N/A',
            color: colorEl.text().trim() || 'N/A'
          }
        };
        
        cars.push(car);
      } catch (err) {
        console.error(`Error extracting car ${i}:`, err);
      }
    });
    
    console.log(`Successfully extracted ${cars.length} cars`);
    
    // If no cars were found, return error instead of mock data
    if (cars.length === 0) {
      console.log('No cars found in HTML, returning error');
      return {
        success: false,
        error: 'No cars found on the website',
        html,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      cars,
      html,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error scraping OpenLane:', error);
    
    // In case of any error, return error message, not mock data
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    console.log('Request body:', body);
    
    // Get the scraping result
    const result = await scrapeOpenLane();
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
});
