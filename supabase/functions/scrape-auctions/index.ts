
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import puppeteer from 'https://esm.sh/puppeteer@21.6.1'

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
      console.error('Missing required credentials');
      console.log('SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_KEY:', !!supabaseKey);
      throw new Error('Missing required credentials');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched');
    
    const page = await browser.newPage();
    
    // Set a user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the page
    await page.goto('https://www.openlane.eu/en/findcar', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('Page loaded');
    
    // Wait for the cars to load
    await page.waitForSelector('.vehicle-card', { timeout: 60000 });
    
    // Extract car data
    const cars = await page.evaluate(() => {
      const carElements = document.querySelectorAll('.vehicle-card');
      
      return Array.from(carElements).map(carEl => {
        // Basic info
        const titleEl = carEl.querySelector('.vehicle-card__title');
        const title = titleEl ? titleEl.textContent?.trim() : '';
        
        // Price
        const priceEl = carEl.querySelector('.vehicle-card__price');
        const priceText = priceEl ? priceEl.textContent?.trim() : '0';
        const priceMatch = priceText?.match(/\d+(?:[.,]\d+)?/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
        
        // Details
        const detailsElements = carEl.querySelectorAll('.vehicle-card__details-item');
        let year = 0;
        let mileage = '';
        let fuel = '';
        let transmission = '';
        
        detailsElements.forEach(detail => {
          const text = detail.textContent?.trim() || '';
          if (/^\d{4}$/.test(text)) {
            year = parseInt(text);
          } else if (text.includes('km')) {
            mileage = text;
          } else if (['Diesel', 'Petrol', 'Electric', 'Hybrid'].some(f => text.includes(f))) {
            fuel = text;
          } else if (['Manual', 'Automatic'].some(t => text.includes(t))) {
            transmission = text;
          }
        });
        
        // External ID
        const idMatch = carEl.id ? carEl.id.match(/\d+/) : null;
        const externalId = idMatch ? idMatch[0] : '';
        
        // Image
        const imgEl = carEl.querySelector('.vehicle-card__image img');
        const imageUrl = imgEl ? imgEl.getAttribute('src') : null;
        
        // Link
        const linkEl = carEl.querySelector('a');
        const externalUrl = linkEl ? 'https://www.openlane.eu' + linkEl.getAttribute('href') : '';
        
        // Make and model from title
        const titleParts = title?.split(' ') || [];
        const make = titleParts.length > 0 ? titleParts[0] : '';
        const model = titleParts.length > 1 ? titleParts.slice(1).join(' ') : '';
        
        // End date (random date in the next 7 days)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        return {
          external_id: externalId || `openlane-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          title: title || 'Unknown Vehicle', // Provide default title if missing
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
          external_url: externalUrl || `https://www.openlane.eu/en/findcar`, // Provide default URL if missing
          end_date: endDate.toISOString(),
          status: 'active'
        };
      });
    });
    
    console.log(`Extracted ${cars.length} cars`);
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
    
    // Filter out any cars missing required fields
    const validCars = cars.filter(car => car.title && car.external_url);
    const invalidCount = cars.length - validCars.length;
    
    if (invalidCount > 0) {
      console.warn(`Filtered out ${invalidCount} cars with missing title or external_url`);
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
        filtered: invalidCount
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
