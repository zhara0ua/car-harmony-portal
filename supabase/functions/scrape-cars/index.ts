
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
    
    // Скрапимо дані з CarOutlet
    console.log('Starting CarOutlet scraping...');
    const crawlResult = await firecrawl.crawlUrl('https://caroutlet.eu/cars', {
      limit: 100,
      scrapeOptions: {
        selectors: {
          cars: {
            selector: '.car-card',
            type: 'list',
            data: {
              title: '.car-title',
              price: {
                selector: '.car-price',
                transform: (price) => parseInt(price.replace(/[^0-9]/g, ''))
              },
              year: {
                selector: '.car-year',
                transform: (year) => parseInt(year)
              },
              mileage: '.car-mileage',
              fuel_type: '.car-fuel',
              transmission: '.car-transmission',
              location: '.car-location',
              image_url: {
                selector: '.car-image',
                attr: 'src'
              },
              external_url: {
                selector: '.car-link',
                attr: 'href'
              },
              external_id: {
                selector: '.car-id',
                attr: 'data-id'
              }
            }
          }
        }
      }
    });

    if (!crawlResult.success) {
      console.error('Crawling failed:', crawlResult.error);
      throw new Error('Failed to crawl CarOutlet');
    }

    const cars = crawlResult.data.cars.map(car => ({
      ...car,
      source: 'caroutlet'
    }));

    console.log(`Found ${cars.length} cars`);

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
