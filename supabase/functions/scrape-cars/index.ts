
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
    console.log('Starting fetch scraping...');

    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };

    // Fetch the page HTML
    console.log('Fetching page HTML...');
    const response = await fetch('https://caroutlet.eu/cars', { 
      headers: browserHeaders
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Got HTML response, length:', html.length);

    // Use regex to extract car data since we can't use DOM parsing
    const cars = [];
    const carBlocks = html.match(/<article[^>]*>[\s\S]*?<\/article>/g) || [];
    
    console.log(`Found ${carBlocks.length} car blocks`);

    for (const block of carBlocks) {
      try {
        // Extract data using regex patterns
        const titleMatch = block.match(/<h2[^>]*>(.*?)<\/h2>/);
        const priceMatch = block.match(/[€₴]?\s*([\d,\.]+)/);
        const yearMatch = block.match(/\b(19|20)\d{2}\b/);
        const mileageMatch = block.match(/(\d+[\d\s,]*(?:km|mil))/i);
        const hrefMatch = block.match(/href="([^"]*\/cars\/[^"]*)"/);
        const imgMatch = block.match(/src="([^"]*\.(?:jpg|jpeg|png|webp))"/i);
        
        if (titleMatch && hrefMatch) {
          const href = hrefMatch[1];
          const external_id = href.split('/').pop() || '';
          
          const car = {
            external_id,
            title: titleMatch[1].trim(),
            price: priceMatch ? parseFloat(priceMatch[1].replace(/[,\s]/g, '')) : 0,
            year: yearMatch ? parseInt(yearMatch[0]) : 0,
            mileage: mileageMatch ? mileageMatch[1].trim() : '',
            fuel_type: '',  // These will need more complex regex or individual page scraping
            transmission: '',
            location: '',
            image_url: imgMatch ? imgMatch[1] : '',
            external_url: href.startsWith('http') ? href : `https://caroutlet.eu${href}`,
            source: 'caroutlet'
          };

          if (car.external_id && car.title && car.price > 0) {
            cars.push(car);
          }
        }
      } catch (err) {
        console.error('Error parsing car block:', err);
      }
    }

    console.log(`Processed ${cars.length} cars:`, cars);

    if (cars.length === 0) {
      throw new Error('No cars found on the page');
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
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Помилка при скрапінгу сторінки',
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
