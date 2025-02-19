
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
    console.log('Starting page scraping...');

    // Simulate real browser headers
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://caroutlet.eu/',
      'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };

    // Fetch the page HTML
    const pageResponse = await fetch('https://caroutlet.eu/uk/cars', {
      headers,
      redirect: 'follow'
    });

    console.log('Response status:', pageResponse.status);
    console.log('Response headers:', Object.fromEntries(pageResponse.headers.entries()));

    if (!pageResponse.ok) {
      throw new Error(`Page fetch failed with status: ${pageResponse.status}`);
    }

    const html = await pageResponse.text();
    console.log('Page HTML length:', html.length);
    
    // Log the first 500 characters to see the page structure
    console.log('Page start:', html.substring(0, 500));
    
    // Find all script tags
    const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
    console.log(`Found ${scriptTags.length} script tags`);
    
    // Look for the __NEXT_DATA__ script specifically
    const nextDataScript = scriptTags.find(script => script.includes('__NEXT_DATA__'));
    if (!nextDataScript) {
      console.log('Available script tags:', scriptTags.map(script => {
        const idMatch = script.match(/id="([^"]+)"/);
        return idMatch ? idMatch[1] : 'no-id';
      }));
      throw new Error('Could not find __NEXT_DATA__ script');
    }

    console.log('Found __NEXT_DATA__ script:', nextDataScript.substring(0, 200));

    // Try to extract the JSON content
    const jsonMatch = nextDataScript.match(/<script[^>]+>([\s\S]*?)<\/script>/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error('Could not extract JSON from __NEXT_DATA__ script');
    }

    // Parse the JSON data
    const jsonContent = jsonMatch[1].trim();
    console.log('JSON content start:', jsonContent.substring(0, 200));

    const pageData = JSON.parse(jsonContent);
    console.log('Parsed data structure:', Object.keys(pageData));

    // Try different paths to find cars data
    const possiblePaths = [
      pageData.props?.pageProps?.cars,
      pageData.props?.initialState?.cars,
      pageData.props?.initialData?.cars,
      pageData.pageProps?.cars,
      pageData.initialProps?.cars
    ];

    console.log('Possible data paths:', possiblePaths.map(path => path ? 'found' : 'not found'));

    // Find first non-null path
    const apiCars = possiblePaths.find(path => Array.isArray(path)) || [];
    console.log(`Found ${apiCars.length} cars in data`);

    if (apiCars.length === 0) {
      // Log the full structure to help debug
      console.log('Full page data structure:', JSON.stringify(pageData, null, 2));
      throw new Error('No cars found in page data');
    }

    // Transform the data
    const cars = apiCars.map((car: any) => ({
      external_id: car.id || String(Math.random()),
      title: car.title || `${car.make} ${car.model}`,
      price: typeof car.price === 'number' ? car.price : parseInt(String(car.price).replace(/[^0-9]/g, '')) || 0,
      year: car.year || new Date().getFullYear(),
      mileage: car.mileage || '0 km',
      fuel_type: car.fuelType?.toLowerCase() || '',
      transmission: car.transmission?.toLowerCase() || '',
      location: car.location || '',
      image_url: car.image || car.imageUrl || '',
      external_url: `https://caroutlet.eu/uk/car/${car.id}`,
      source: 'caroutlet',
      created_at: new Date().toISOString()
    }));

    console.log('Transformed cars data:', cars.slice(0, 2));

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
    console.error('Detailed API error:', {
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
