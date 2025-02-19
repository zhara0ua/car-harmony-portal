
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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
    console.log('Starting Puppeteer scraping...');

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page
    console.log('Navigating to CarOutlet...');
    await page.goto('https://caroutlet.eu/cars', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for car elements to load
    await page.waitForSelector('.vehicle-card, .card, article', { timeout: 5000 });

    // Extract car data
    console.log('Extracting car data...');
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.vehicle-card, .card, article');
      return Array.from(carElements).map(el => {
        const titleEl = el.querySelector('h2, h3, .title, [class*="title"]');
        const priceEl = el.querySelector('[class*="price"], .price, .amount');
        const yearEl = el.querySelector('[class*="year"], .year');
        const mileageEl = el.querySelector('[class*="mileage"], .mileage, [class*="odometer"]');
        const locationEl = el.querySelector('[class*="location"], .location');
        const imageEl = el.querySelector('img');
        const linkEl = el.querySelector('a[href*="/cars/"]');
        const fuelEl = el.querySelector('[class*="fuel"], [class*="engine"]');
        const transmissionEl = el.querySelector('[class*="transmission"], [class*="gearbox"]');

        const href = linkEl?.getAttribute('href') || '';
        const id = href.split('/').pop() || '';

        return {
          external_id: id,
          title: titleEl?.textContent?.trim() || '',
          price: parseFloat((priceEl?.textContent?.match(/\d+/g) || []).join('')) || 0,
          year: parseInt(yearEl?.textContent?.trim() || '') || 0,
          mileage: mileageEl?.textContent?.trim() || '',
          fuel_type: fuelEl?.textContent?.trim().toLowerCase() || '',
          transmission: transmissionEl?.textContent?.trim().toLowerCase() || '',
          location: locationEl?.textContent?.trim() || '',
          image_url: imageEl?.getAttribute('src') || '',
          external_url: href.startsWith('http') ? href : `https://caroutlet.eu${href}`,
          source: 'caroutlet'
        };
      }).filter(car => car.external_id && car.title && car.price > 0);
    });

    // Close browser
    await browser.close();

    console.log(`Found ${cars.length} cars:`, cars);

    if (cars.length === 0) {
      throw new Error('No cars found on the page');
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
        error: error instanceof Error ? error.message : 'Помилка при скрапінгу сторінки',
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
