
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

    // Ініціалізуємо Firecrawl з розширеними налаштуваннями
    const firecrawl = new FirecrawlApp({ 
      apiKey: firecrawlApiKey,
      defaultOptions: {
        timeout: 60000,
        maxRetries: 3
      }
    });
    console.log('Firecrawl initialized with custom configuration');

    // Спробуємо отримати контент з більш конкретними налаштуваннями
    console.log('Starting crawl request...');
    const crawlResult = await firecrawl.crawlUrl('https://caroutlet.eu/cars', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
      maxRetries: 3,
      scrapeOptions: {
        formats: ['html'],
        waitForSelectors: ['.car-item', '.car-listing', '.vehicle-item'],
        headless: true,
        javascript: true
      }
    });

    console.log('Crawl request completed');
    console.log('Response success:', crawlResult.success);
    console.log('Response type:', typeof crawlResult.data);
    console.log('Response data preview:', 
      typeof crawlResult.data === 'string' 
        ? crawlResult.data.substring(0, 200) 
        : 'Not a string'
    );

    if (!crawlResult.success) {
      console.error('Crawl failed with error:', crawlResult.error);
      throw new Error('Failed to crawl page: ' + (crawlResult.error || 'Unknown error'));
    }

    // Перевіряємо отримані дані
    if (!crawlResult.data) {
      console.error('No data received from crawl');
      throw new Error('No data received from crawling');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Скрапінг успішно завершено',
        dataReceived: !!crawlResult.data
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in scrape-cars function:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
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
