
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
    
    // Fetch the main page
    const response = await fetch('https://caroutlet.eu/cars', {
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
    const carElements = document.querySelectorAll('.car-card'); // Adjust selector based on actual HTML

    carElements.forEach((element) => {
      try {
        // These selectors need to be adjusted based on the actual HTML structure
        const title = element.querySelector('.car-title')?.textContent?.trim() || '';
        const priceText = element.querySelector('.car-price')?.textContent?.trim() || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        const yearText = element.querySelector('.car-year')?.textContent?.trim() || '';
        const year = parseInt(yearText) || new Date().getFullYear();
        const mileage = element.querySelector('.car-mileage')?.textContent?.trim() || '0 km';
        const fuelType = element.querySelector('.car-fuel')?.textContent?.toLowerCase().trim() || '';
        const transmission = element.querySelector('.car-transmission')?.textContent?.toLowerCase().trim() || '';
        const location = element.querySelector('.car-location')?.textContent?.trim() || '';
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
      } catch (err) {
        console.error('Error parsing car element:', err);
      }
    });

    console.log(`Parsed ${cars.length} cars from the webpage`);

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
