
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
    
    const response = await fetch('https://caroutlet.eu/uk/cars', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Website responded with status: ${response.status}`);
    }

    const html = await response.text();
    console.log('Received HTML content');

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    if (!document) {
      throw new Error('Failed to parse HTML');
    }

    const cars = [];
    // Updated selector to match the actual grid items
    const carElements = document.querySelectorAll('div[class*="CarTile_container"]');
    console.log(`Found ${carElements.length} car elements`);

    carElements.forEach((element) => {
      try {
        // Updated selectors based on actual HTML structure
        const titleEl = element.querySelector('h2[class*="CarTile_title"]');
        const title = titleEl?.textContent?.trim() || '';
        
        const priceEl = element.querySelector('p[class*="CarTile_price"]');
        const priceText = priceEl?.textContent?.trim() || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        
        const detailsEl = element.querySelectorAll('div[class*="CarTile_parameters"] span');
        let year = new Date().getFullYear();
        let mileage = '0 km';
        let fuelType = '';
        let transmission = '';
        
        detailsEl.forEach((detail) => {
          const text = detail.textContent?.trim() || '';
          if (/^\d{4}$/.test(text)) {
            year = parseInt(text);
          } else if (text.includes('км')) {
            mileage = text;
          } else if (['бензин', 'дизель', 'гібрид', 'електро'].some(fuel => text.toLowerCase().includes(fuel))) {
            fuelType = text.toLowerCase();
          } else if (['автомат', 'механіка'].some(trans => text.toLowerCase().includes(trans))) {
            transmission = text.toLowerCase();
          }
        });

        const location = element.querySelector('div[class*="CarTile_location"]')?.textContent?.trim() || '';
        const imageUrl = element.querySelector('img')?.getAttribute('src') || '';
        const link = element.querySelector('a')?.getAttribute('href') || '';
        const id = link.split('/').pop() || Math.random().toString();

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
          external_url: `https://caroutlet.eu${link}`,
          source: 'caroutlet',
          created_at: new Date().toISOString()
        });

        console.log('Parsed car:', { title, price, year, mileage });
      } catch (err) {
        console.error('Error parsing car element:', err);
      }
    });

    console.log(`Successfully parsed ${cars.length} cars from the webpage`);

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
