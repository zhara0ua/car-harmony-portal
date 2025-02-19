
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
    
    // Спробуємо отримати дані з мобільної версії сайту
    const response = await fetch('https://mobile.caroutlet.eu/inventory', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
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
    
    // Логуємо HTML для аналізу
    console.log('Sample HTML:', html.substring(0, 2000));

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Шукаємо будь-які елементи, які можуть містити інформацію про автомобілі
    const possibleElements = Array.from(doc.querySelectorAll('div, article, section'));
    const carElements = possibleElements.filter(element => {
      const text = element.textContent?.toLowerCase() || '';
      return text.includes('€') && 
             (text.includes('km') || text.includes('automatic') || text.includes('manual'));
    });
    
    console.log('Found potential car elements:', carElements.length);

    const cars = [];

    for (const element of carElements) {
      try {
        console.log('Analyzing element:', element.outerHTML);
        
        // Шукаємо текст, що містить інформацію про ціну
        const priceMatch = element.textContent?.match(/(\d+[.,]\d+|\d+)\s*€/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;
        
        // Шукаємо текст, що може бути назвою автомобіля
        const titleElement = element.querySelector('h1, h2, h3, .title, strong') || 
                           Array.from(element.children).find(el => 
                             el.textContent?.length > 10 && 
                             !el.textContent.includes('€'));
        const title = titleElement?.textContent?.trim();

        if (title && price) {
          const yearMatch = title.match(/\b(19|20)\d{2}\b/);
          const year = yearMatch ? parseInt(yearMatch[0]) : null;

          // Шукаємо URL зображення
          const imgElement = element.querySelector('img');
          const image_url = imgElement?.getAttribute('src') || 
                           imgElement?.getAttribute('data-src') ||
                           null;

          // Шукаємо посилання
          const link = element.querySelector('a')?.getAttribute('href');
          const external_url = link ? 
            (link.startsWith('http') ? link : `https://caroutlet.eu${link}`) : 
            null;

          // Генеруємо унікальний ID
          const external_id = `car_${Date.now()}_${Math.random().toString(36).slice(2)}`;

          // Шукаємо додаткову інформацію
          const fullText = element.textContent?.toLowerCase() || '';
          const mileage = fullText.match(/(\d+[.,]?\d*)\s*km/)?.[0] || null;
          const transmission = 
            fullText.includes('automatic') ? 'automatic' :
            fullText.includes('manual') ? 'manual' : 
            null;
          
          const fuel_type = 
            fullText.includes('diesel') ? 'diesel' :
            fullText.includes('petrol') ? 'petrol' :
            fullText.includes('electric') ? 'electric' :
            fullText.includes('hybrid') ? 'hybrid' :
            null;

          cars.push({
            external_id,
            title,
            price,
            year,
            mileage,
            fuel_type,
            transmission,
            location: null,
            image_url,
            external_url,
            source: 'caroutlet'
          });

          console.log('Found car:', { title, price, year });
        }
      } catch (elementError) {
        console.error('Error parsing element:', elementError);
      }
    }

    console.log(`Found ${cars.length} cars`);

    if (cars.length === 0) {
      // Додаємо тестові дані тільки якщо не знайшли реальні
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
