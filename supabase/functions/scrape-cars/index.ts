
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

    if (!supabaseUrl || !supabaseKey || !firecrawlApiKey) {
      console.error('Missing required credentials');
      console.log('SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_KEY:', !!supabaseKey);
      console.log('FIRECRAWL_API_KEY:', !!firecrawlApiKey);
      throw new Error('Missing required credentials');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Базова конфігурація Firecrawl
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
    console.log('Firecrawl initialized');

    // Спрощений запит скрапінгу
    const crawlResult = await firecrawl.crawlUrl('https://caroutlet.eu/cars', {
      format: 'html'
    });

    console.log('Crawl response received');
    console.log('Response type:', typeof crawlResult);
    console.log('Response structure:', Object.keys(crawlResult));

    if (!crawlResult || !crawlResult.success) {
      const errorMessage = crawlResult?.error || 'Unknown error';
      console.error('Crawl failed:', errorMessage);
      console.error('Full response:', JSON.stringify(crawlResult, null, 2));
      throw new Error(`Failed to crawl page: ${errorMessage}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Запит до сайту виконано успішно',
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
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
