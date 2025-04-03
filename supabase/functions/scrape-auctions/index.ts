
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders, createScrapingHeaders } from './helpers.ts';
import { parseHtmlForCars } from './parser.ts';

/**
 * Handles CORS preflight requests
 */
function handleCorsRequest() {
  return new Response(null, { 
    status: 200,
    headers: corsHeaders 
  });
}

/**
 * Fetches HTML content from target website
 */
async function fetchAuctionData() {
  console.log('Fetching data from openlane.eu...');
  const response = await fetch('https://www.openlane.eu/en/findcar', {
    method: 'GET',
    headers: createScrapingHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }
  
  const htmlContent = await response.text();
  console.log('Received HTML content, length:', htmlContent.length);
  
  return htmlContent;
}

/**
 * Initializes Supabase client with admin privileges
 */
function initializeSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required credentials');
    console.log('SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_KEY:', !!supabaseKey);
    throw new Error('Missing required credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Stores the parsed cars in the database
 */
async function storeAuctionCars(supabaseAdmin, cars) {
  if (cars.length === 0) {
    console.warn('No valid cars found during scraping');
    return 0;
  }
  
  console.log(`Storing ${cars.length} cars in the database`);
  
  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('auction_cars')
    .upsert(cars, { 
      onConflict: 'external_id',
      ignoreDuplicates: false
    });
  
  if (insertError) {
    console.error('Error inserting cars:', insertError);
    throw new Error(`Failed to insert cars: ${insertError.message}`);
  }
  
  console.log('Cars successfully stored in the database');
  return cars.length;
}

/**
 * Creates a success response with the given data
 */
function createSuccessResponse(count, skipped) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Dane z aukcji zostały zaktualizowane',
      count,
      skipped
    }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Creates an error response with the given error
 */
function createErrorResponse(error) {
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

/**
 * Main handler for the scrape-auctions endpoint
 */
async function handleAuctionScraping() {
  try {
    console.log('Starting scraping process...');
    
    // Initialize Supabase client
    const supabaseAdmin = initializeSupabaseAdmin();
    console.log('Supabase client initialized');
    
    // Perform database health check
    const { error: healthCheckError } = await supabaseAdmin
      .from('auction_cars')
      .select('id')
      .limit(1);
      
    if (healthCheckError) {
      console.error('Database health check failed:', healthCheckError);
      throw new Error(`Database health check failed: ${healthCheckError.message}`);
    }
    
    // Fetch auction data
    const htmlContent = await fetchAuctionData();
    
    // Parse HTML for cars
    const cars = parseHtmlForCars(htmlContent);
    console.log(`Extracted ${cars.length} cars using simple parsing`);
    
    // Filter out cars missing required fields
    const validCars = cars.filter(car => car.title && car.external_url);
    const skippedCount = cars.length - validCars.length;
    
    if (skippedCount > 0) {
      console.warn(`Skipped ${skippedCount} cars with missing title or external_url`);
    }
    
    // Store cars in database
    const storedCount = await storeAuctionCars(supabaseAdmin, validCars);
    
    return createSuccessResponse(storedCount, skippedCount);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Function handler
Deno.serve(async (req) => {
  console.log('Received request:', req.method);
  
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }
  
  return handleAuctionScraping();
});
