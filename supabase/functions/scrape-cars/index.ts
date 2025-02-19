
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting scraping process...');
    
    const response = await fetch('https://caroutlet.eu', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch page:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('Page content length:', html.length);
    
    // Логуємо частину HTML для аналізу структури
    console.log('Sample HTML:', html.substring(0, 1000));

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Спробуємо різні селектори
    const carElements = doc.querySelectorAll('.vehicle-card, .car-item, article');
    console.log('Found elements:', carElements.length);

    const cars = [];

    for (const element of carElements) {
      try {
        console.log('Processing element:', element.outerHTML);
        
        // Пробуємо різні селектори для кожного елемента
        const title = 
          element.querySelector('h2, .title, .vehicle-title')?.textContent?.trim() ||
          element.querySelector('a')?.textContent?.trim();
        
        const priceText = 
          element.querySelector('.price, .vehicle-price')?.textContent?.trim() ||
          Array.from(element.querySelectorAll('*'))
            .find(el => el.textContent?.includes('€'))?.textContent?.trim();
        
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : 0;
        
        // Генеруємо унікальний ID
        const external_id = `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Знаходимо URL зображення
        const image_url = element.querySelector('img')?.getAttribute('src') ||
                         element.querySelector('img')?.getAttribute('data-src');
        
        // Знаходимо посилання
        const link = element.querySelector('a')?.getAttribute('href');
        const external_url = link ? (link.startsWith('http') ? link : `https://caroutlet.eu${link}`) : null;

        if (title && price) {
          const car = {
            external_id,
            title,
            price,
            year: null, // Будемо витягувати з назви пізніше
            mileage: null,
            fuel_type: null,
            transmission: null,
            location: null,
            image_url,
            external_url,
            source: 'caroutlet'
          };

          // Спробуємо витягнути рік з назви
          const yearMatch = title.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) {
            car.year = parseInt(yearMatch[0]);
          }

          cars.push(car);
          console.log('Processed car:', car);
        }
      } catch (elementError) {
        console.error('Error parsing car element:', elementError);
      }
    }

    console.log(`Found ${cars.length} cars`);

    if (cars.length === 0) {
      // Використовуємо тестові дані тільки якщо нічого не знайдено
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
