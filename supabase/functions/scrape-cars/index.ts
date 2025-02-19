
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('Starting scraping process...');
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };

    const response = await fetch('https://caroutlet.eu/uk/cars', { headers });

    if (!response.ok) {
      console.error('Failed to fetch:', response.status, response.statusText);
      throw new Error(`Website responded with status: ${response.status}`);
    }

    const html = await response.text();
    console.log('Response headers:', response.headers);
    console.log('HTML length:', html.length);
    console.log('First 1000 chars of HTML:', html.substring(0, 1000));

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    if (!document) {
      throw new Error('Failed to parse HTML');
    }

    const cars = [];
    
    // Get all car elements with multiple possible selectors
    const selectors = [
      'div.grid div[role="gridcell"]',
      'div.car-list > div',
      'div.vehicle-item',
      '.car-grid-item',
      '[data-testid="car-tile"]'
    ];

    let carElements = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        carElements = elements;
        break;
      }
    }

    console.log(`Total car elements found: ${carElements.length}`);

    if (carElements.length === 0) {
      // Try to find any div that might contain car information
      const allDivs = document.querySelectorAll('div');
      console.log('Total divs found:', allDivs.length);
      console.log('Sample of divs:', Array.from(allDivs).slice(0, 5).map(div => div.outerHTML).join('\n'));
    }

    carElements.forEach((element, index) => {
      try {
        console.log(`\nParsing car element ${index + 1}:`);
        console.log('Element HTML:', element.outerHTML);

        // Multiple selectors for each field
        const titleSelectors = ['h2', 'h3', '[class*="title"]', '.name', 'a[href*="/car/"]'];
        let title = '';
        for (const selector of titleSelectors) {
          const titleEl = element.querySelector(selector);
          if (titleEl) {
            title = titleEl.textContent?.trim() || '';
            console.log(`Found title with selector ${selector}:`, title);
            break;
          }
        }

        const priceSelectors = ['[class*="price"]', '.price', 'span:contains("€")', 'strong'];
        let price = 0;
        for (const selector of priceSelectors) {
          const priceEl = element.querySelector(selector);
          if (priceEl) {
            const priceText = priceEl.textContent?.trim() || '0';
            price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
            console.log(`Found price with selector ${selector}:`, price);
            break;
          }
        }

        let year = new Date().getFullYear();
        let mileage = '0 km';
        let fuelType = '';
        let transmission = '';
        let location = '';

        // Try to find all text nodes that might contain car details
        const walkNode = (node: Element) => {
          const text = node.textContent?.trim() || '';
          if (text) {
            console.log('Processing text:', text);
            
            if (/^\d{4}$/.test(text)) {
              year = parseInt(text);
            } else if (text.includes('км')) {
              mileage = text;
            } else if (['бензин', 'дизель', 'гібрид', 'електро'].some(fuel => text.toLowerCase().includes(fuel))) {
              fuelType = text.toLowerCase();
            } else if (['автомат', 'механіка'].some(trans => text.toLowerCase().includes(trans))) {
              transmission = text.toLowerCase();
            } else if (text.includes('м.')) {
              location = text;
            }
          }

          node.childNodes?.forEach((child: Element) => {
            if (child.nodeType === 1) { // Element node
              walkNode(child);
            }
          });
        };

        walkNode(element);

        const imageUrl = element.querySelector('img')?.getAttribute('src') || '';
        const link = element.querySelector('a')?.getAttribute('href') || '';
        const id = link.split('/').pop() || `car-${index + 1}`;

        console.log('Extracted car data:', {
          id,
          title,
          price,
          year,
          mileage,
          fuelType,
          transmission,
          location,
          imageUrl,
          link
        });

        if (title && price > 0) {
          cars.push({
            external_id: id,
            title,
            price,
            year,
            mileage,
            fuel_type: fuelType,
            transmission,
            location,
            image_url: imageUrl,
            external_url: link.startsWith('http') ? link : `https://caroutlet.eu${link}`,
            source: 'caroutlet',
            created_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error parsing car element:', err);
      }
    });

    console.log(`Successfully parsed ${cars.length} cars from the webpage`);

    if (cars.length === 0) {
      throw new Error('No cars found on the page. The website structure might have changed.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Saving cars to database...');
    let savedCount = 0;
    
    for (const car of cars) {
      const { error } = await supabaseAdmin
        .from('scraped_cars')
        .upsert(car, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error saving car:', error);
        throw error;
      } else {
        savedCount++;
      }
    }

    console.log(`Successfully saved ${savedCount} cars`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Успішно оновлено ${savedCount} автомобілів` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Detailed scraping error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Невідома помилка',
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 200
      }
    );
  }
});
