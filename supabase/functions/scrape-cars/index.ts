
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    console.log('Starting page scraping...');

    // Simulate real browser headers
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    // Fetch the page HTML
    const pageResponse = await fetch('https://caroutlet.eu/uk/cars', {
      headers,
      redirect: 'follow'
    });

    if (!pageResponse.ok) {
      throw new Error(`Page fetch failed with status: ${pageResponse.status}`);
    }

    const html = await pageResponse.text();
    console.log('Page HTML length:', html.length);

    // Try to extract the JSON data from the __NEXT_DATA__ script tag
    const scriptDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!scriptDataMatch || !scriptDataMatch[1]) {
      console.error('Could not find __NEXT_DATA__ script in HTML');
      throw new Error('Could not extract car data from page');
    }

    console.log('Found __NEXT_DATA__ script');
    
    // Parse the JSON data
    const pageData = JSON.parse(scriptDataMatch[1]);
    console.log('Page data structure:', Object.keys(pageData));

    // Extract cars from the page data
    const apiCars = pageData.props?.pageProps?.cars || [];
    console.log(`Found ${apiCars.length} cars in page data`);

    if (apiCars.length === 0) {
      throw new Error('No cars found in page data');
    }

    // Transform the data
    const cars = apiCars.map((car: any) => ({
      external_id: car.id || String(Math.random()),
      title: car.title || `${car.make} ${car.model}`,
      price: typeof car.price === 'number' ? car.price : parseInt(String(car.price).replace(/[^0-9]/g, '')) || 0,
      year: car.year || new Date().getFullYear(),
      mileage: car.mileage || '0 km',
      fuel_type: car.fuelType?.toLowerCase() || '',
      transmission: car.transmission?.toLowerCase() || '',
      location: car.location || '',
      image_url: car.image || car.imageUrl || '',
      external_url: `https://caroutlet.eu/uk/car/${car.id}`,
      source: 'caroutlet',
      created_at: new Date().toISOString()
    }));

    console.log('Transformed cars data:', cars.slice(0, 2));

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
    console.error('Detailed API error:', {
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
