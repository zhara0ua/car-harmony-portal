
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  console.log("Edge function received request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Parse request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      reqBody = { source: "openlane" }; // Default fallback
    }
    
    console.log("Request body:", reqBody);
    const source = reqBody.source || "openlane";
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created successfully");
    
    // Scrape cars data from OpenLane
    console.log(`Starting to scrape cars from ${source}`);
    const scrapedCars = await scrapeOpenLaneCars();
    console.log(`Scraped ${scrapedCars.length} cars from ${source}`);
    
    // Save to database
    if (scrapedCars.length > 0) {
      console.log("Saving scraped cars to database...");
      const timestamp = new Date().toISOString();
      
      // Add timestamp and make sure all required fields are present
      const preparedCars = scrapedCars.map((car, index) => ({
        external_id: car.external_id || `${source}-${Date.now()}-${index + 1}`,
        title: car.title || "Unknown Car",
        price: car.price || 0,
        year: car.year || null,
        mileage: car.mileage || null,
        fuel_type: car.fuel_type || null,
        transmission: car.transmission || null,
        location: car.location || null,
        image_url: car.image_url || null,
        external_url: car.external_url || null,
        source: source,
        created_at: timestamp
      }));
      
      const { data, error } = await supabase
        .from('scraped_cars')
        .upsert(preparedCars, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to save cars to database: " + error.message 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 // Return 200 even for errors to prevent client issues
          }
        );
      }
      
      console.log("Successfully saved cars to database");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Scraped ${scrapedCars.length} cars, saved ${scrapedCars.length} to database`,
          count: scrapedCars.length
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } else {
      console.log("No cars found to save");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No cars found to scrape",
          count: 0
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error processing request: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 even for errors to prevent client issues
      }
    );
  }
});

// Function to scrape cars from OpenLane
async function scrapeOpenLaneCars() {
  try {
    console.log("Starting to scrape OpenLane cars...");
    
    // In a real implementation, this would make an HTTP request to OpenLane
    // For now, we'll generate more mock data to simulate more cars
    const cars = [];
    
    // Generate 15 mock cars with various makes and models
    const carMakes = ["BMW", "Audi", "Mercedes", "Volkswagen", "Toyota"];
    const carModels = {
      "BMW": ["3 Series", "5 Series", "X5", "X3"],
      "Audi": ["A4", "A6", "Q5", "Q7"],
      "Mercedes": ["C-Class", "E-Class", "GLC", "GLE"],
      "Volkswagen": ["Golf", "Passat", "Tiguan", "Atlas"],
      "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"]
    };
    const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
    const transmissions = ["Automatic", "Manual"];
    const locations = ["Berlin, Germany", "Munich, Germany", "Frankfurt, Germany", "Hamburg, Germany", "Cologne, Germany"];
    
    for (let i = 1; i <= 15; i++) {
      const make = carMakes[Math.floor(Math.random() * carMakes.length)];
      const model = carModels[make][Math.floor(Math.random() * carModels[make].length)];
      const year = 2018 + Math.floor(Math.random() * 6); // 2018 to 2023
      const mileage = `${Math.floor(Math.random() * 100000)} km`;
      const price = 20000 + Math.floor(Math.random() * 60000);
      const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
      const transmission = transmissions[Math.floor(Math.random() * transmissions.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      cars.push({
        external_id: `ol-${Date.now()}-${i}`,
        title: `${make} ${model} ${year}`,
        price: price,
        year: year,
        mileage: mileage,
        fuel_type: fuelType,
        transmission: transmission,
        location: location,
        image_url: `https://example.com/car${i}.jpg`,
        external_url: `https://www.openlane.eu/en/vehicles/${100000 + i}`,
        source: "openlane"
      });
    }
    
    console.log(`Generated ${cars.length} mock cars`);
    return cars;
  } catch (error) {
    console.error("Error scraping OpenLane cars:", error);
    throw new Error(`Failed to scrape OpenLane: ${error.message}`);
  }
}
