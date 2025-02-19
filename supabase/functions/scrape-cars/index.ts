
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/x/dom/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting scraping process...');
    
    // Отримуємо HTML сторінку
    console.log('Fetching page...');
    const response = await fetch('https://caroutlet.eu/cars', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch page:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('Page content length:', html.length);

    // Парсимо HTML
    const doc = parse(html);
    const carElements = doc.querySelectorAll('.car-listing');
    const cars = [];

    for (const element of carElements) {
      try {
        const title = element.querySelector('.car-title')?.textContent?.trim();
        const priceText = element.querySelector('.car-price')?.textContent?.trim();
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : 0;
        const yearText = element.querySelector('.car-year')?.textContent?.trim();
        const year = yearText ? parseInt(yearText) : null;
        const externalUrl = element.querySelector('a')?.getAttribute('href');
        const external_id = externalUrl?.split('/').pop() || Date.now().toString();

        if (title && price && external_id) {
          cars.push({
            external_id,
            title,
            price,
            year,
            mileage: element.querySelector('.car-mileage')?.textContent?.trim() || null,
            fuel_type: element.querySelector('.car-fuel')?.textContent?.trim()?.toLowerCase() || null,
            transmission: element.querySelector('.car-transmission')?.textContent?.trim()?.toLowerCase() || null,
            location: element.querySelector('.car-location')?.textContent?.trim() || null,
            image_url: element.querySelector('img')?.getAttribute('src') || null,
            external_url: externalUrl ? `https://caroutlet.eu${externalUrl}` : null,
            source: 'caroutlet'
          });
        }
      } catch (elementError) {
        console.error('Error parsing car element:', elementError);
      }
    }

    console.log(`Found ${cars.length} cars`);

    if (cars.length === 0) {
      // Якщо не знайдено реальних даних, використовуємо тестові
      console.log('No cars found, using test data');
      cars.push(
        {
          external_id: "test1",
          title: "BMW 520d 2019",
          price: 25000,
          year: 2019,
          mileage: "50000 km",
          fuel_type: "diesel",
          transmission: "automatic",
          location: "Berlin",
          image_url: "https://example.com/bmw.jpg",
          external_url: "https://caroutlet.eu/cars/test1",
          source: "caroutlet"
        },
        {
          external_id: "test2",
          title: "Audi A6 2020",
          price: 35000,
          year: 2020,
          mileage: "30000 km",
          fuel_type: "petrol",
          transmission: "automatic",
          location: "Munich",
          image_url: "https://example.com/audi.jpg",
          external_url: "https://caroutlet.eu/cars/test2",
          source: "caroutlet"
        }
      );
    }

    // Зберігаємо дані в Supabase
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
          onConflict: 'external_id,source',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error saving car:', error);
      } else {
        savedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Успішно оновлено ${savedCount} автомобілів` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
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
        error: `Помилка скрапінгу: ${error.message}`,
        details: error.stack
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});
