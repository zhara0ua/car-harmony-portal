
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
    console.log('Starting web scraping...');

    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    // Fetch the page HTML
    const response = await fetch('https://caroutlet.eu/cars', { headers });
    const html = await response.text();
    
    console.log('HTML content received:', html.substring(0, 500) + '...');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Log the document structure
    console.log('Document structure:', doc.querySelector('body')?.innerHTML?.substring(0, 500) + '...');

    // Try different selectors
    const carElements = doc.querySelectorAll('.card, .vehicle-card, article');
    console.log(`Found ${carElements.length} car elements with broader selectors`);

    const cars = [];

    for (const carElement of carElements) {
      try {
        console.log('Processing car element:', carElement.outerHTML);

        // Try multiple possible selectors for each field
        const titleElement = carElement.querySelector('h2, h3, .title, [class*="title"]');
        const priceElement = carElement.querySelector('[class*="price"], .price, .amount');
        const yearElement = carElement.querySelector('[class*="year"], .year');
        const mileageElement = carElement.querySelector('[class*="mileage"], .mileage, [class*="odometer"]');
        const locationElement = carElement.querySelector('[class*="location"], .location');
        const imageElement = carElement.querySelector('img');
        const linkElement = carElement.querySelector('a[href*="/cars/"]');
        const fuelTypeElement = carElement.querySelector('[class*="fuel"], [class*="engine"]');
        const transmissionElement = carElement.querySelector('[class*="transmission"], [class*="gearbox"]');

        console.log('Found elements:', {
          title: titleElement?.textContent,
          price: priceElement?.textContent,
          year: yearElement?.textContent,
          mileage: mileageElement?.textContent,
          location: locationElement?.textContent,
          image: imageElement?.getAttribute('src'),
          link: linkElement?.getAttribute('href'),
          fuel: fuelTypeElement?.textContent,
          transmission: transmissionElement?.textContent
        });

        const id = linkElement?.getAttribute('href')?.split('/').pop() || '';
        const title = titleElement?.textContent?.trim() || '';
        const priceText = priceElement?.textContent?.trim() || '';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        const year = parseInt(yearElement?.textContent?.trim() || '') || 0;
        const mileage = mileageElement?.textContent?.trim() || '';
        const location = locationElement?.textContent?.trim() || '';
        const imageUrl = imageElement?.getAttribute('src') || '';
        const externalUrl = linkElement ? 
          (linkElement.getAttribute('href')?.startsWith('http') ? 
            linkElement.getAttribute('href') : 
            `https://caroutlet.eu${linkElement.getAttribute('href')}`) : 
          '';
        const fuelType = fuelTypeElement?.textContent?.trim().toLowerCase() || '';
        const transmission = transmissionElement?.textContent?.trim().toLowerCase() || '';

        if (id && title && price) {
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
            external_url: externalUrl,
            source: 'caroutlet'
          });
        }
      } catch (error) {
        console.error('Error parsing car element:', error);
      }
    }

    console.log(`Parsed ${cars.length} cars successfully:`, cars);

    if (cars.length === 0) {
      throw new Error('No cars found on the page. This might be due to:' + 
        '\n1. Different HTML structure than expected' +
        '\n2. Dynamic content loading' +
        '\n3. Bot protection');
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
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Невідома помилка під час скрапінгу',
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
