
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
    console.log('Starting GraphQL API request...');
    
    const headers = {
      'Accept': 'application/json',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    // GraphQL query for cars
    const query = {
      query: `
        query GetCars {
          cars {
            id
            title
            price
            year
            mileage
            fuelType
            transmission
            location
            image
            make
            model
          }
        }
      `
    };

    // Make request to the GraphQL API endpoint
    const response = await fetch('https://caroutlet.eu/api/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify(query)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch:', response.status, response.statusText);
      console.error('Error response:', errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    const data = JSON.parse(responseText);
    console.log('Parsed API response:', data);

    // Extract cars from the API response
    const apiCars = data?.data?.cars || [];
    console.log(`Found ${apiCars.length} cars in API response`);

    if (apiCars.length === 0) {
      // If GraphQL fails, try fetching directly from the page's script data
      console.log('No cars found in GraphQL response, trying to fetch from page...');
      
      const pageResponse = await fetch('https://caroutlet.eu/uk/cars', {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        }
      });

      if (!pageResponse.ok) {
        throw new Error(`Page fetch failed with status: ${pageResponse.status}`);
      }

      const html = await pageResponse.text();
      
      // Try to extract the JSON data from the script tag
      const scriptDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (scriptDataMatch && scriptDataMatch[1]) {
        const pageData = JSON.parse(scriptDataMatch[1]);
        console.log('Found page data:', pageData);
        
        // Extract cars from the page data
        const pageCars = pageData.props?.pageProps?.cars || [];
        if (pageCars.length > 0) {
          console.log(`Found ${pageCars.length} cars in page data`);
          apiCars.push(...pageCars);
        }
      }
    }

    if (apiCars.length === 0) {
      throw new Error('No cars found in any data source');
    }

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

    console.log('Transformed cars data:', cars.slice(0, 2)); // Log first 2 cars for debugging

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
