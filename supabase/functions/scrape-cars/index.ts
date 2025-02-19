
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    console.log('Starting scraping process...');
    
    // Тестові дані
    const cars = [
      {
        external_id: "test1",
        title: "BMW 520d 2019",
        price: 25000,
        year: 2019,
        mileage: "50000 km",
        fuel_type: "дизель",
        transmission: "автомат",
        location: "Берлін",
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
        fuel_type: "бензин",
        transmission: "автомат",
        location: "Мюнхен",
        image_url: "https://example.com/audi.jpg",
        external_url: "https://caroutlet.eu/cars/test2",
        source: "caroutlet"
      }
    ];

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Saving cars to database...');
    let savedCount = 0;
    
    for (const car of cars) {
      const { error } = await supabaseAdmin
        .from('scraped_cars')
        .upsert(
          {
            ...car,
            created_at: new Date().toISOString()
          },
          { 
            onConflict: 'external_id',
            ignoreDuplicates: false
          }
        );
      
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
        error: error.message || 'Невідома помилка',
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
