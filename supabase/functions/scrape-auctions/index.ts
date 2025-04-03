
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
    const proxyList = Deno.env.get('PROXY_LIST');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required credentials');
      console.log('SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_KEY:', !!supabaseKey);
      throw new Error('Missing required credentials');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Use fetch with custom headers instead of puppeteer
    console.log('Starting fetch with custom headers...');
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Use a proxy if available
    const fetchOptions = {
      method: 'GET',
      headers: headers,
    };
    
    console.log('Fetching data from openlane.eu...');
    const response = await fetch('https://www.openlane.eu/en/findcar', fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const htmlContent = await response.text();
    console.log('Received HTML content, length:', htmlContent.length);
    
    // Simple HTML parsing
    const carData = parseHtmlForCars(htmlContent);
    console.log(`Extracted ${carData.length} cars using simple parsing`);
    
    // Filter out cars missing required fields, instead of failing the whole operation
    const validCars = carData.filter(car => car.title && car.external_url);
    const skippedCount = carData.length - validCars.length;
    
    if (skippedCount > 0) {
      console.warn(`Skipped ${skippedCount} cars with missing title or external_url`);
    }
    
    if (validCars.length > 0) {
      // Store the scraped cars in the database
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('auction_cars')
        .upsert(validCars, { 
          onConflict: 'external_id',
          ignoreDuplicates: false
        });
      
      if (insertError) {
        console.error('Error inserting cars:', insertError);
        throw new Error(`Failed to insert cars: ${insertError.message}`);
      }
      
      console.log('Cars successfully stored in the database');
    } else {
      console.warn('No valid cars found during scraping');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dane z aukcji zostały zaktualizowane',
        count: validCars.length,
        skipped: skippedCount
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
        error: error instanceof Error ? error.message : 'Niespodziewany błąd podczas scrapowania'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simple HTML parser function
function parseHtmlForCars(htmlContent: string) {
  const cars = [];
  const carCardRegex = /<div[^>]*class="vehicle-card"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  
  let matches;
  let index = 0;
  
  while ((matches = carCardRegex.exec(htmlContent)) !== null && index < 20) {
    try {
      const cardHtml = matches[1];
      
      // Extract basic info
      const titleMatch = cardHtml.match(/<div[^>]*class="vehicle-card__title"[^>]*>([\s\S]*?)<\/div>/);
      const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
      
      // Skip if no title (just continue to next car without returning)
      if (!title) {
        console.log(`Car #${index + 1} has no title, skipping`);
        continue;
      }
      
      // Price
      const priceMatch = cardHtml.match(/<div[^>]*class="vehicle-card__price"[^>]*>([\s\S]*?)<\/div>/);
      const priceText = priceMatch ? cleanHtml(priceMatch[1]) : '0';
      const priceNumMatch = priceText.match(/\d+(?:[.,]\d+)?/);
      const price = priceNumMatch ? parseFloat(priceNumMatch[0].replace(',', '.')) : 0;
      
      // Image URL
      const imgMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
      const imageUrl = imgMatch ? imgMatch[1] : null;
      
      // Link
      const linkMatch = cardHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
      const externalUrl = linkMatch ? 'https://www.openlane.eu' + linkMatch[1] : '';
      
      // Skip if no external URL (just continue to next car without returning)
      if (!externalUrl) {
        console.log(`Car #${index + 1} has no external URL, skipping`);
        continue;
      }
      
      // Extract details
      const detailsMatch = cardHtml.match(/<div[^>]*class="vehicle-card__details"[^>]*>([\s\S]*?)<\/div>/);
      const detailsHtml = detailsMatch ? detailsMatch[1] : '';
      
      const detailsRegex = /<div[^>]*class="vehicle-card__details-item"[^>]*>([\s\S]*?)<\/div>/g;
      let detailsMatches;
      let year = 0;
      let mileage = '';
      let fuel = '';
      let transmission = '';
      
      while ((detailsMatches = detailsRegex.exec(detailsHtml)) !== null) {
        const detailText = cleanHtml(detailsMatches[1]);
        if (/^\d{4}$/.test(detailText)) {
          year = parseInt(detailText);
        } else if (detailText.includes('km')) {
          mileage = detailText;
        } else if (['Diesel', 'Petrol', 'Electric', 'Hybrid'].some(f => detailText.includes(f))) {
          fuel = detailText;
        } else if (['Manual', 'Automatic'].some(t => detailText.includes(t))) {
          transmission = detailText;
        }
      }
      
      // Make and model from title
      const titleParts = title.split(' ');
      const make = titleParts.length > 0 ? titleParts[0] : '';
      const model = titleParts.length > 1 ? titleParts.slice(1).join(' ') : '';
      
      // Generate a unique external ID
      const externalId = `openlane-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${index}`;
      
      // End date (random date in the next 7 days)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      cars.push({
        external_id: externalId,
        title: title,
        start_price: price,
        current_price: price,
        year,
        make,
        model,
        mileage,
        fuel_type: fuel,
        transmission,
        location: 'Openlane EU',
        image_url: imageUrl,
        external_url: externalUrl,
        end_date: endDate.toISOString(),
        status: 'active'
      });
      
      index++;
    } catch (e) {
      console.error('Error parsing car card:', e);
    }
  }
  
  return cars;
}

// Helper function to clean HTML
function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
