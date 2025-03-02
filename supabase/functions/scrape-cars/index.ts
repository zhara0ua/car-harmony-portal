
// Import required modules from Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Mock data for testing purposes
const MOCK_CARS = [
  {
    external_id: "mock-1",
    title: "Mock BMW X5 2022",
    price: 35000,
    year: 2022,
    mileage: "15,000 km",
    fuel_type: "Diesel",
    transmission: "Automatic",
    location: "Warsaw",
    image_url: "https://placehold.co/600x400?text=Mock+BMW+X5",
    external_url: "https://example.com/car/1",
    source: "mock"
  },
  {
    external_id: "mock-2",
    title: "Mock Audi A6 2021",
    price: 32000,
    year: 2021,
    mileage: "25,000 km",
    fuel_type: "Petrol",
    transmission: "Automatic",
    location: "Krakow",
    image_url: "https://placehold.co/600x400?text=Mock+Audi+A6",
    external_url: "https://example.com/car/2",
    source: "mock"
  }
];

serve(async (req: Request) => {
  console.log("Initializing scrape-cars function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body with error handling
    let requestData = {};
    try {
      const bodyText = await req.text();
      console.log("Request body text:", bodyText);
      
      if (bodyText && bodyText.trim() !== "") {
        requestData = JSON.parse(bodyText);
      } else {
        console.log("Empty request body, using default options");
      }
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      // Continue with empty requestData object
    }
    
    // Log the request data for debugging
    console.log("Request options:", requestData);
    
    // Check if real data is requested or if we should use mock data
    // Default to true if the parameter is missing or invalid
    const useRealData = requestData?.forceRealData !== false;
    
    console.log(`Using ${useRealData ? 'REAL' : 'MOCK'} data`);
    
    if (!useRealData) {
      console.log("Returning mock data");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Mock cars retrieved successfully",
          cars: MOCK_CARS
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // For now, return the message that we can't run the Python subprocess
    // and fallback to mock data with an appropriate message
    console.log("Subprocess spawning not allowed, returning mock data as fallback");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Unable to run web scraping directly in Edge Functions. Using mock data instead. Consider implementing a different approach such as a scheduled external scraper that saves data to the database.",
        cars: MOCK_CARS
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`,
        error: error.stack || "No stack trace available"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
