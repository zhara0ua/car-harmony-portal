
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@0.0.28'

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
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

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

    if (!firecrawlApiKey) {
      console.error('Missing Firecrawl API key');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration error: Missing Firecrawl API key'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Ініціалізуємо Firecrawl
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
    console.log('Firecrawl initialized with API key');

    // Використовуємо простий HTTP запит для отримання контенту
    const crawlResult = await firecrawl.crawlUrl('https://caroutlet.eu/cars', {
      limit: 1,
      format: 'html',
      waitForSelector: '.cars-list'
    });

    console.log('Raw crawl result:', JSON.stringify(crawlResult, null, 2));

    // Створюємо тестові дані для перевірки роботи бази даних
    const testCars = [
      {
        external_id: `test-${Date.now()}-1`,
        title: 'Test Car 1',
        price: 15000,
        year: 2020,
        mileage: '50000 km',
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        location: 'Test Location',
        image_url: 'https://example.com/car1.jpg',
        external_url: 'https://caroutlet.eu/cars/1',
        source: 'caroutlet'
      }
    ];

    console.log('Attempting to save test car data');

    // Додаємо тестові дані в базу
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
          error: 'Failed to save test data'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Test data saved successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Тестові дані успішно додано',
        carsCount: testCars.length
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
