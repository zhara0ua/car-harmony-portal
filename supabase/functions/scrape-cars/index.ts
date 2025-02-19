
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
    console.log('Starting scraping process...');
    
    // Fetch data from CarOutlet API
    const response = await fetch('https://api.caroutlet.eu/api/cars/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 1,
        limit: 50,
        filters: {},
        sort: { created_at: -1 }
      })
    });

    if (!response.ok) {
      throw new Error(`CarOutlet API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data from CarOutlet:', data);

    if (!data.cars || !Array.isArray(data.cars)) {
      throw new Error('Invalid response format from CarOutlet API');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Saving cars to database...');
    let savedCount = 0;
    
    for (const carData of data.cars) {
      const car = {
        external_id: carData.id.toString(),
        title: `${carData.make} ${carData.model} ${carData.year}`,
        price: carData.price,
        year: carData.year,
        mileage: `${carData.mileage} km`,
        fuel_type: carData.fuel_type?.toLowerCase(),
        transmission: carData.transmission?.toLowerCase(),
        location: carData.location,
        image_url: carData.image_url,
        external_url: `https://caroutlet.eu/car/${carData.id}`,
        source: 'caroutlet',
        created_at: new Date().toISOString()
      };

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
    console.error('Detailed scraping error:', {
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
