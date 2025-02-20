
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
    
    // Спробуємо спочатку отримати HTML сторінки
    const urlToCrawl = 'https://caroutlet.eu/cars';
    console.log('Attempting to crawl URL:', urlToCrawl);
    
    // Спрощений скрапінг для тестування
    const crawlResult = await firecrawl.crawlUrl(urlToCrawl, {
      limit: 10,
      scrapeOptions: {
        selectors: {
          cars: {
            selector: '.car-box',
            type: 'list',
            data: {
              title: '.car-box__title',
              price: '.car-box__price',
              external_url: {
                selector: 'a',
                attr: 'href'
              }
            }
          }
        }
      }
    });

    console.log('Raw crawl result:', JSON.stringify(crawlResult, null, 2));

    if (!crawlResult.success) {
      console.error('Crawling failed:', crawlResult.error);
      throw new Error(`Failed to crawl CarOutlet: ${crawlResult.error || 'Unknown error'}`);
    }

    if (!crawlResult.data || !crawlResult.data.cars || !Array.isArray(crawlResult.data.cars)) {
      console.error('Invalid data structure received:', crawlResult);
      throw new Error('Invalid data structure received from CarOutlet');
    }

    const cars = crawlResult.data.cars.map((car, index) => ({
      ...car,
      external_id: `caroutlet-${Date.now()}-${index}`,
      source: 'caroutlet'
    }));

    console.log('Processed cars data:', JSON.stringify(cars, null, 2));
    console.log(`Found ${cars.length} cars`);

    if (cars.length === 0) {
      throw new Error('No cars found on the page');
    }

    // Додаємо або оновлюємо дані в базі
    const { error: insertError } = await supabaseAdmin
      .from('scraped_cars')
      .upsert(cars, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error('Error inserting scraped data:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save scraped data'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Cars data saved successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Дані успішно оновлено',
        carsCount: cars.length
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
