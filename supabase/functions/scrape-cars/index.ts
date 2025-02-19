
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    // Navigate to openlane.eu
    await page.goto('https://openlane.eu/uk/cars');
    
    // Wait for car listings to load
    await page.waitForSelector('.car-listing');
    
    // Extract car data
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.car-listing');
      return Array.from(carElements).map(car => {
        return {
          title: car.querySelector('.car-title')?.textContent?.trim(),
          price: parseFloat(car.querySelector('.car-price')?.textContent?.replace(/[^0-9]/g, '') || '0'),
          year: parseInt(car.querySelector('.car-year')?.textContent?.trim() || '0'),
          mileage: car.querySelector('.car-mileage')?.textContent?.trim(),
          location: car.querySelector('.car-location')?.textContent?.trim(),
          image_url: car.querySelector('img')?.getAttribute('src'),
          external_url: car.querySelector('a')?.getAttribute('href'),
          external_id: car.getAttribute('data-id') || crypto.randomUUID(),
          source: 'openlane',
          fuel_type: car.querySelector('.car-fuel')?.textContent?.trim(),
          transmission: car.querySelector('.car-transmission')?.textContent?.trim()
        };
      });
    });

    // Insert cars into database
    const { error } = await supabase
      .from('scraped_cars')
      .upsert(
        cars.map(car => ({
          ...car,
          external_url: car.external_url?.startsWith('http') 
            ? car.external_url 
            : `https://openlane.eu${car.external_url}`
        })),
        { 
          onConflict: 'external_id',
          ignoreDuplicates: true 
        }
      );

    if (error) throw error;

    await browser.close();

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully scraped ${cars.length} cars`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
