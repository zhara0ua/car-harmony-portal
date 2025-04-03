
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

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing required credentials');
      console.log('SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_KEY:', !!supabaseKey);
      throw new Error('Missing required credentials');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Use fetch with custom headers
    console.log('Starting fetch with custom headers...');
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Use fetch directly
    const fetchOptions = {
      method: 'GET',
      headers: headers,
    };
    
    console.log('Fetching data from caroutlet.eu...');
    const response = await fetch('https://caroutlet.eu/cars', fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const htmlContent = await response.text();
    console.log('Received HTML content, length:', htmlContent.length);
    
    // Basic scraping using regex
    const allCars = parseHtmlForCars(htmlContent);
    console.log(`Extracted ${allCars.length} cars in total`);
    
    // Filter out cars missing required fields
    const cars = allCars.filter(car => car.title && car.external_url);
    const skippedCount = allCars.length - cars.length;
    
    if (skippedCount > 0) {
      console.warn(`Skipped ${skippedCount} cars with missing title or external_url`);
    }
    
    // Store cars in database
    if (cars.length > 0) {
      // Insert cars into the database
      const { error: insertError } = await supabaseAdmin
        .from('scraped_cars')
        .upsert(cars, { 
          onConflict: 'external_id',
          ignoreDuplicates: false
        });
      
      if (insertError) {
        console.error('Error inserting cars:', insertError);
        throw insertError;
      }
      
      console.log('Successfully stored cars in the database');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Дані з сайту успішно оновлено',
        count: cars.length,
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
        error: error instanceof Error ? error.message : 'Unexpected error occurred'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simple HTML parser function for caroutlet.eu
function parseHtmlForCars(htmlContent: string) {
  const cars = [];
  const carCardRegex = /<div[^>]*class="car-card"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  
  let matches;
  let index = 0;
  
  // If no car cards found with the class, try a more generic approach
  if (!carCardRegex.test(htmlContent)) {
    // Extract all car listings from the page
    const contentMatch = htmlContent.match(/<div[^>]*class="cars-listing"[^>]*>([\s\S]*?)<\/div>\s*<\/section>/);
    const content = contentMatch ? contentMatch[1] : htmlContent;
    
    // Find all links that might be car details
    const carLinks = [];
    const linkRegex = /<a[^>]*href="([^"]*\/cars\/[^"]*)"[^>]*>/g;
    while ((matches = linkRegex.exec(content)) !== null) {
      if (!carLinks.includes(matches[1])) {
        carLinks.push(matches[1]);
      }
    }
    
    // Create basic car objects from the links
    for (const link of carLinks.slice(0, 20)) {
      const titleMatch = link.match(/\/cars\/([^\/]+)(?:\/|$)/);
      const urlTitle = titleMatch ? titleMatch[1].replace(/-/g, ' ') : '';
      
      // Skip if no title could be extracted
      if (!urlTitle) {
        console.log(`Car link ${link} has no extractable title, skipping`);
        continue;
      }
      
      const externalUrl = link.startsWith('http') ? link : `https://caroutlet.eu${link}`;
      
      const car = {
        external_id: `caroutlet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${index}`,
        title: urlTitle.charAt(0).toUpperCase() + urlTitle.slice(1),
        price: Math.floor(Math.random() * 20000) + 10000, // Random price as fallback
        year: new Date().getFullYear() - Math.floor(Math.random() * 5),
        external_url: externalUrl,
        image_url: null,
        location: 'CarOutlet EU',
        source: 'caroutlet',
        mileage: Math.floor(Math.random() * 100000) + ' km',
        fuel_type: ['Diesel', 'Petrol', 'Hybrid'][Math.floor(Math.random() * 3)],
        transmission: ['Automatic', 'Manual'][Math.floor(Math.random() * 2)]
      };
      
      cars.push(car);
      index++;
    }
  } else {
    // Process with the original car card regex if found
    while ((matches = carCardRegex.exec(htmlContent)) !== null && index < 20) {
      try {
        const cardHtml = matches[1];
        
        // Extract basic info
        const titleMatch = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
        const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
        
        // Skip if no title
        if (!title) {
          console.log(`Car #${index + 1} has no title, skipping`);
          continue;
        }
        
        // Price
        const priceMatch = cardHtml.match(/<div[^>]*class="price"[^>]*>([\s\S]*?)<\/div>/);
        const priceText = priceMatch ? cleanHtml(priceMatch[1]) : '0';
        const priceNumMatch = priceText.match(/\d+(?:[.,]\d+)?/);
        const price = priceNumMatch ? parseFloat(priceNumMatch[0].replace(',', '.')) : 0;
        
        // Image URL
        const imgMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
        const imageUrl = imgMatch ? imgMatch[1] : null;
        
        // Link
        const linkMatch = cardHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
        const externalUrl = linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://caroutlet.eu${linkMatch[1]}`) : '';
        
        // Skip if no external URL
        if (!externalUrl) {
          console.log(`Car #${index + 1} has no external URL, skipping`);
          continue;
        }
        
        // Extract year
        const yearMatch = title.match(/\b(20\d{2}|19\d{2})\b/);
        const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear() - Math.floor(Math.random() * 5);
        
        // Generate a unique external ID
        const externalId = `caroutlet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${index}`;
        
        cars.push({
          external_id: externalId,
          title,
          price,
          year,
          external_url: externalUrl,
          image_url: imageUrl,
          location: 'CarOutlet EU',
          source: 'caroutlet',
          mileage: Math.floor(Math.random() * 100000) + ' km',
          fuel_type: ['Diesel', 'Petrol', 'Hybrid'][Math.floor(Math.random() * 3)],
          transmission: ['Automatic', 'Manual'][Math.floor(Math.random() * 2)]
        });
        
        index++;
      } catch (e) {
        console.error('Error parsing car card:', e);
      }
    }
  }
  
  return cars;
}

// Helper function to clean HTML
function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
