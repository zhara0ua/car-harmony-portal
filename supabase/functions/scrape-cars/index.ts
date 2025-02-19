
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    console.log('Navigating to caroutlet.eu...');
    await page.goto('https://caroutlet.eu/cars');
    
    // Чекаємо поки завантажаться елементи
    await page.waitForSelector('.car-card');
    
    console.log('Scraping car data...');
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.car-card');
      return Array.from(carElements).map(car => {
        const title = car.querySelector('.car-title')?.textContent?.trim();
        const priceText = car.querySelector('.car-price')?.textContent?.trim();
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : 0;
        const yearText = car.querySelector('.car-year')?.textContent?.trim();
        const year = yearText ? parseInt(yearText) : null;
        const mileage = car.querySelector('.car-mileage')?.textContent?.trim();
        const fuelType = car.querySelector('.car-fuel')?.textContent?.trim();
        const transmission = car.querySelector('.car-transmission')?.textContent?.trim();
        const location = car.querySelector('.car-location')?.textContent?.trim();
        const imageUrl = car.querySelector('img')?.getAttribute('src');
        const externalUrl = car.querySelector('a')?.getAttribute('href');
        const externalId = externalUrl?.split('/').pop() || '';

        return {
          external_id: externalId,
          title,
          price,
          year,
          mileage,
          fuel_type: fuelType,
          transmission,
          location,
          image_url: imageUrl,
          external_url: externalUrl,
        };
      });
    });

    console.log(`Found ${cars.length} cars`);
    
    await browser.close();
    
    // Зберігаємо дані в Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Saving to database...');
    for (const car of cars) {
      const { error } = await supabase
        .from('scraped_cars')
        .upsert(car, { 
          onConflict: 'external_id,source',
          ignoreDuplicates: true 
        });
      
      if (error) {
        console.error('Error saving car:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Scraped ${cars.length} cars` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
