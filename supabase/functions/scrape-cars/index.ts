
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // Set CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    console.log('Starting browser...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    console.log('Navigating to caroutlet.eu...');
    await page.goto('https://caroutlet.eu/cars/', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    console.log('Waiting for car listings...');
    await page.waitForSelector('.car-item', { timeout: 30000 });
    
    console.log('Extracting car data...');
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.car-item');
      return Array.from(carElements).map(car => {
        const priceText = car.querySelector('.price')?.textContent?.replace(/[^0-9]/g, '') || '0';
        const yearText = car.querySelector('.year')?.textContent?.trim() || '';
        
        return {
          external_id: car.getAttribute('data-id') || crypto.randomUUID(),
          title: car.querySelector('.title')?.textContent?.trim() || 'Untitled Car',
          price: parseInt(priceText, 10),
          year: parseInt(yearText, 10) || null,
          mileage: car.querySelector('.mileage')?.textContent?.trim() || null,
          fuel_type: car.querySelector('.fuel-type')?.textContent?.trim()?.toLowerCase() || null,
          transmission: car.querySelector('.transmission')?.textContent?.trim()?.toLowerCase() || null,
          location: car.querySelector('.location')?.textContent?.trim() || null,
          image_url: car.querySelector('img')?.getAttribute('src') || null,
          external_url: car.querySelector('a')?.getAttribute('href') || null,
          source: 'caroutlet'
        };
      });
    });

    console.log(`Found ${cars.length} cars`);
    
    if (cars.length === 0) {
      throw new Error('No cars found on the page');
    }

    // Process cars to ensure external_url is complete
    const processedCars = cars.map(car => ({
      ...car,
      external_url: car.external_url?.startsWith('http') 
        ? car.external_url 
        : `https://caroutlet.eu${car.external_url}`
    }));

    console.log('Inserting cars into database...');
    const { error } = await supabase
      .from('scraped_cars')
      .upsert(processedCars, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    await browser.close();
    console.log('Scraping completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully scraped ${cars.length} cars`
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});
