
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting scraping process...');
    
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ]
    });

    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    console.log('Navigating to caroutlet.eu...');
    
    try {
      await page.goto('https://caroutlet.eu/cars/', {
        waitUntil: 'networkidle0',
        timeout: 90000 // Increase timeout to 90 seconds
      });
    } catch (error) {
      console.error('Navigation error:', error);
      throw new Error('Failed to load the website');
    }

    console.log('Waiting for car listings...');
    
    try {
      await page.waitForSelector('.car-item', { timeout: 60000 });
    } catch (error) {
      console.error('Selector error:', error);
      const content = await page.content();
      console.log('Page content:', content.substring(0, 500)); // Log first 500 chars
      throw new Error('Car listings not found on the page');
    }

    console.log('Extracting car data...');
    
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.car-item');
      const results = [];
      
      for (const car of carElements) {
        try {
          const priceEl = car.querySelector('.price');
          const priceText = priceEl ? priceEl.textContent?.replace(/[^0-9]/g, '') : '0';
          const price = parseInt(priceText || '0', 10);
          
          const yearEl = car.querySelector('.year');
          const yearText = yearEl ? yearEl.textContent?.trim() : '';
          const year = parseInt(yearText || '0', 10);
          
          results.push({
            external_id: car.getAttribute('data-id') || crypto.randomUUID(),
            title: car.querySelector('.title')?.textContent?.trim() || 'Untitled Car',
            price: price || 0,
            year: year || null,
            mileage: car.querySelector('.mileage')?.textContent?.trim() || null,
            fuel_type: car.querySelector('.fuel-type')?.textContent?.trim()?.toLowerCase() || null,
            transmission: car.querySelector('.transmission')?.textContent?.trim()?.toLowerCase() || null,
            location: car.querySelector('.location')?.textContent?.trim() || null,
            image_url: car.querySelector('img')?.getAttribute('src') || null,
            external_url: car.querySelector('a')?.getAttribute('href') || null,
            source: 'caroutlet'
          });
        } catch (error) {
          console.error('Error processing car element:', error);
          continue;
        }
      }
      
      return results;
    });

    console.log(`Found ${cars.length} cars`);

    if (cars.length === 0) {
      throw new Error('No cars found on the page');
    }

    // Process external URLs
    const processedCars = cars.map(car => ({
      ...car,
      external_url: car.external_url?.startsWith('http') 
        ? car.external_url 
        : `https://caroutlet.eu${car.external_url}`
    }));

    console.log('Inserting cars into database...');
    
    const { error: upsertError } = await supabase
      .from('scraped_cars')
      .upsert(processedCars, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw upsertError;
    }

    await browser.close();
    console.log('Scraping completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Успішно імпортовано ${cars.length} автомобілів`
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
});
