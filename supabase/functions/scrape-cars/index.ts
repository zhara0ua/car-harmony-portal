
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    console.log('Fetching cars data...');
    
    // Імітуємо браузерний запит
    const response = await fetch('https://caroutlet.eu/api/cars', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cars = await response.json();
    console.log(`Found ${cars.length} cars`);

    // Зберігаємо дані в Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Saving to database...');
    for (const carData of cars) {
      const car = {
        external_id: carData.id.toString(),
        title: carData.title,
        price: parseFloat(carData.price),
        year: parseInt(carData.year),
        mileage: carData.mileage,
        fuel_type: carData.fuelType?.toLowerCase(),
        transmission: carData.transmission?.toLowerCase(),
        location: carData.location,
        image_url: carData.imageUrl,
        external_url: `https://caroutlet.eu/cars/${carData.id}`,
        source: 'caroutlet'
      };

      const { error } = await supabaseAdmin
        .from('scraped_cars')
        .upsert(car, { 
          onConflict: 'external_id,source',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error saving car:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Успішно оновлено ${cars.length} автомобілів` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
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
