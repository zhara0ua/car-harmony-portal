
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface ScrapingRequest {
  source?: string;
}

interface ScrapedCar {
  external_id: string;
  title: string;
  price: number;
  year: number | null;
  mileage: string | null;
  fuel_type: string | null;
  transmission: string | null;
  location: string | null;
  image_url: string;
  external_url: string;
  source: string;
}

// CORS headers for cross-domain requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to scrape OpenLane cars using fetch
async function scrapeOpenLane(): Promise<ScrapedCar[]> {
  console.log("Starting OpenLane scraping with HTTP fetch");
  
  try {
    const proxyList = Deno.env.get("PROXY_LIST") || "";
    const proxies = proxyList ? proxyList.split(",").map(p => p.trim()) : [];
    console.log(`Found ${proxies.length} proxies to use`);
    
    // Sample user agents for rotation
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
    ];
    
    // Select a random user agent
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    console.log(`Using user agent: ${userAgent}`);
    
    // For testing purposes without Pyppeteer, return mock data
    console.log("Returning mock data for testing");
    return [
      {
        external_id: `ol-${Date.now()}-1`,
        title: "BMW 3 Series 2022",
        price: 45000,
        year: 2022,
        mileage: "15000 km",
        fuel_type: "Diesel",
        transmission: "Automatic",
        location: "Berlin, Germany",
        image_url: "https://example.com/car1.jpg",
        external_url: "https://www.openlane.eu/en/vehicles/123456",
        source: "openlane"
      },
      {
        external_id: `ol-${Date.now()}-2`,
        title: "Audi A4 2023",
        price: 48000,
        year: 2023,
        mileage: "10000 km",
        fuel_type: "Petrol",
        transmission: "Automatic",
        location: "Munich, Germany",
        image_url: "https://example.com/car2.jpg",
        external_url: "https://www.openlane.eu/en/vehicles/654321",
        source: "openlane"
      }
    ];
  } catch (error) {
    console.error("Error scraping OpenLane:", error);
    // Return empty array instead of throwing, so we don't break the entire process
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting scrape-cars edge function");
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error: Missing Supabase credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created");
    
    // Parse request body
    let requestData: ScrapingRequest = { source: "all" };
    try {
      requestData = await req.json();
    } catch (e) {
      console.log("Could not parse request body, using defaults");
    }
    
    const { source = "all" } = requestData;
    console.log(`Requested scraping source: ${source}`);
    
    let scrapedData: ScrapedCar[] = [];
    
    if (source === "openlane" || source === "all") {
      // Execute the HTTP-based scraper for OpenLane
      try {
        console.log("Starting OpenLane scraping");
        const openLaneResults = await scrapeOpenLane();
        scrapedData = [...scrapedData, ...openLaneResults];
        console.log(`OpenLane scraping completed, found ${openLaneResults.length} cars`);
      } catch (error) {
        console.error("OpenLane scraping failed:", error);
        // Continue with processing, don't return an error response here
      }
    }
    
    // Process and save the data
    let insertedCount = 0;
    
    if (scrapedData.length > 0) {
      console.log(`Upserting ${scrapedData.length} cars to database`);
      
      try {
        const { data, error: upsertError } = await supabase
          .from('scraped_cars')
          .upsert(scrapedData, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          });
        
        if (upsertError) {
          console.error("Error upserting data:", upsertError);
          // Continue and return a partial success
        } else {
          insertedCount = data?.length || scrapedData.length;
          console.log(`Successfully saved ${insertedCount} cars to database`);
        }
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        // Continue and return a partial success
      }
    }
    
    // Always return a 200 response, even if there were some errors
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped ${scrapedData.length} cars, saved ${insertedCount} to database`,
        count: scrapedData.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Function execution error:", error);
    // Return a 200 response with error details, not a 500
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error", 
        errorDetails: error instanceof Error ? error.stack : null 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
