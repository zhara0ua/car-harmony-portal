
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ScrapingRequest {
  forceRealData?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 204,
    });
  }

  try {
    console.log("Starting scrape-cars function execution");
    
    // Parse request body with error handling
    let requestData: ScrapingRequest = { forceRealData: false };
    
    if (req.method === "POST" && req.body) {
      try {
        const body = await req.text();
        if (body && body.trim()) {
          requestData = JSON.parse(body);
        }
      } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        // Continue with default values
      }
    }
    
    console.log("Request options:", requestData);

    // Check if we should force real data
    const useRealData = requestData.forceRealData === true;
    
    if (!useRealData) {
      console.log("Using mock data as forceRealData is not set to true");
      // Return mock data for testing
      return new Response(
        JSON.stringify({
          success: true,
          message: "Mock data returned. Set forceRealData to true to use real scraping.",
          cars: [
            {
              external_id: "ol-" + Date.now() + "-1",
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
              external_id: "ol-" + Date.now() + "-2",
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
          ]
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }

    console.log("Starting real data scraping process");
    
    // Execute the Python script for scraping
    const command = new Deno.Command("python3", {
      args: ["openlane_scraper.py"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();
    
    // Handle command execution errors
    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr);
      console.error("Scraper process error:", errorOutput);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error executing scraper script",
          error: errorOutput,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    // Process successful output
    const output = new TextDecoder().decode(stdout);
    console.log("Scraper output received, length:", output.length);
    
    try {
      // Parse the JSON output from the Python script
      const cars = JSON.parse(output);
      
      // Insert scraped data into the database
      const { error: upsertError } = await insertScrapedCars(cars);
      
      if (upsertError) {
        console.error("Error inserting scraped cars:", upsertError);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error saving scraped data to database",
            error: upsertError.message,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 500,
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Scraping completed successfully",
          cars: cars,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    } catch (jsonError) {
      console.error("Error parsing scraper output:", jsonError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error parsing scraper output",
          error: jsonError.message,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in edge function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unhandled server error",
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});

// Function to insert scraped cars into the database
async function insertScrapedCars(cars: any[]) {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log(`Inserting ${cars.length} scraped cars into database`);
  
  return await supabase.from("scraped_cars").upsert(
    cars.map(car => ({
      external_id: car.external_id,
      title: car.title,
      price: car.price,
      year: car.year,
      mileage: car.mileage,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      location: car.location,
      image_url: car.image_url,
      external_url: car.external_url,
      source: car.source
    })),
    { onConflict: "external_id" }
  );
}
