
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface ScrapingRequest {
  source?: string;
}

// CORS headers for cross-domain requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the Auth context of the function
const executeOpenlaneScrapingScript = async () => {
  const process = new Deno.Command("python", {
    args: ["openlane_scraper.py"],
    stdout: "piped",
    stderr: "piped",
  });
  
  const { stdout, stderr, success } = await process.output();
  
  if (!success) {
    const errorOutput = new TextDecoder().decode(stderr);
    console.error("Python script execution failed:", errorOutput);
    throw new Error(`Script execution failed: ${errorOutput}`);
  }
  
  const output = new TextDecoder().decode(stdout);
  console.log("Python script output:", output);
  
  try {
    return JSON.parse(output);
  } catch (e) {
    console.error("Failed to parse script output as JSON:", e);
    throw new Error("Invalid script output format");
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const requestData: ScrapingRequest = await req.json();
    const { source = "all" } = requestData;
    
    let scrapedData = [];
    
    if (source === "openlane" || source === "all") {
      // Execute the Python scraper script for OpenLane
      try {
        const openLaneResults = await executeOpenlaneScrapingScript();
        scrapedData = [...scrapedData, ...openLaneResults];
      } catch (error) {
        console.error("OpenLane scraping failed:", error);
        return new Response(
          JSON.stringify({ success: false, error: `OpenLane scraping failed: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }
    
    // Process and save the data
    let insertedCount = 0;
    
    if (scrapedData.length > 0) {
      const { error: upsertError, count } = await supabase
        .from('scraped_cars')
        .upsert(scrapedData, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        })
        .select("count");
      
      if (upsertError) {
        console.error("Error upserting data:", upsertError);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to save data: ${upsertError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      insertedCount = count || scrapedData.length;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped ${scrapedData.length} cars, saved ${insertedCount} to database`,
        count: scrapedData.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function execution error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
