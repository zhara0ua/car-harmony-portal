
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
    console.log('Starting API fetching...');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Fetch cars data from API
    const response = await fetch('https://caroutlet.eu/api/v1/cars', { headers });
    const data = await response.json();
    
    console.log('API response received:', data);

    if (!Array.isArray(data)) {
      throw new Error('Invalid API response format');
    }

    const cars = data.map(car => ({
      external_id: car.id.toString(),
      title: car.title || `${car.make} ${car.model} ${car.year}`,
      price: parseFloat(car.price),
      year: parseInt(car.year),
      mileage: car.mileage,
      fuel_type: car.fuel_type?.toLowerCase(),
      transmission: car.transmission?.toLowerCase(),
      location: car.location,
      image_url: car.image_url,
      external_url: `https://caroutlet.eu/cars/${car.id}`,
      source: 'caroutlet'
    }));

    console.log(`Processed ${cars.length} cars:`, cars);

    if (cars.length === 0) {
      throw new Error('No cars found in API response');
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
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Помилка при отриманні даних з API',
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
