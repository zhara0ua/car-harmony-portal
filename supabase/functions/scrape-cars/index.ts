
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log('Received request:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  try {
    console.log('Starting scraping process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration error: Missing Supabase credentials'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Тестові дані для додавання
    const testCars = [
      {
        external_id: 'test-1',
        title: 'BMW X5 2020',
        price: 35000,
        year: 2020,
        mileage: '50000 km',
        fuel_type: 'Дизель',
        transmission: 'Автомат',
        location: 'Київ',
        image_url: 'https://example.com/bmw.jpg',
        external_url: 'https://example.com/bmw-x5',
        source: 'caroutlet'
      },
      {
        external_id: 'test-2',
        title: 'Audi Q7 2021',
        price: 45000,
        year: 2021,
        mileage: '30000 km',
        fuel_type: 'Бензин',
        transmission: 'Автомат',
        location: 'Львів',
        image_url: 'https://example.com/audi.jpg',
        external_url: 'https://example.com/audi-q7',
        source: 'caroutlet'
      }
    ];

    // Додавання тестових даних до бази
    const { error: insertError } = await supabaseAdmin
      .from('scraped_cars')
      .upsert(testCars, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error('Error inserting test data:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to insert test data'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Test data inserted successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Дані успішно оновлено'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in scrape-cars function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error occurred'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
