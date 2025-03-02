
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("Initializing scrape-cars function");

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log(`Received ${req.method} request`);
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      requestBody = { source: "openlane" }; // Default fallback
    }
    
    const source = requestBody.source || "openlane";
    console.log(`Scraping cars from source: ${source}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Scrape OpenLane website
    const cars = await scrapeOpenLane();
    console.log(`Scraped ${cars.length} cars from OpenLane`);

    // Insert cars into database
    const timestamp = new Date().toISOString();
    const carsWithMetadata = cars.map((car, index) => ({
      ...car,
      external_id: `ol-${Date.now()}-${index + 1}`,
      source: source,
    }));

    const { error: insertError } = await supabase
      .from("scraped_cars")
      .upsert(carsWithMetadata, { 
        onConflict: "external_id",
        ignoreDuplicates: false
      });

    if (insertError) {
      console.error("Error inserting cars into database:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error inserting cars: ${insertError.message}`,
          error: insertError.message,
        }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped ${cars.length} cars, saved ${cars.length} to database`,
        count: cars.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scrape-cars function:", error);
    return new Response(
      JSON.stringify({
        success: false, 
        message: error.message || "Unknown error",
        error: error.message,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function scrapeOpenLane() {
  console.log("Starting to scrape OpenLane website");
  try {
    // Fetch the OpenLane website
    const response = await fetch("https://www.openlane.eu/en/vehicles", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML content (length: ${html.length} characters)`);
    
    // Parse the HTML to extract car data
    const cars = parseOpenLaneHtml(html);
    console.log(`Parsed ${cars.length} cars from HTML`);
    
    return cars;
  } catch (error) {
    console.error("Error scraping OpenLane:", error);
    // If scraping fails, return an empty array instead of throwing
    return [];
  }
}

function parseOpenLaneHtml(html: string) {
  // Simple DOM parser for extracting car data
  console.log("Parsing HTML to extract car data");
  
  const cars = [];
  try {
    // Look for car listing elements in the HTML
    const carListingRegex = /<div[^>]*class="[^"]*vehicle-list-item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
    const matches = html.matchAll(carListingRegex);
    
    for (const match of matches) {
      const carHtml = match[0];
      
      // Extract car title
      const titleMatch = carHtml.match(/<h2[^>]*class="[^"]*vehicle-list-item-title[^"]*"[^>]*>.*?<a[^>]*>(.*?)<\/a>/s);
      const title = titleMatch ? cleanText(titleMatch[1]) : "Unknown Model";
      
      // Extract URL
      const urlMatch = carHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
      const relativeUrl = urlMatch ? urlMatch[1] : "";
      const externalUrl = relativeUrl ? `https://www.openlane.eu${relativeUrl}` : "";
      
      // Extract price
      const priceMatch = carHtml.match(/<div[^>]*class="[^"]*vehicle-list-item-price[^"]*"[^>]*>(.*?)<\/div>/s);
      const priceText = priceMatch ? cleanText(priceMatch[1]).replace(/[^0-9]/g, "") : "0";
      const price = parseInt(priceText) || 0;
      
      // Extract image
      const imageMatch = carHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
      const imageUrl = imageMatch ? imageMatch[1] : null;
      
      // Extract year
      const yearMatch = carHtml.match(/(\b20\d{2}\b)/);
      const year = yearMatch ? parseInt(yearMatch[1]) : null;
      
      // Extract other details
      const mileageMatch = carHtml.match(/(\d+[\s,.]*\d*)\s*km/i);
      const mileage = mileageMatch ? `${mileageMatch[1]} km` : null;
      
      // Fuel type detection
      let fuelType = null;
      if (carHtml.includes("Petrol") || carHtml.includes("Gasoline")) {
        fuelType = "Petrol";
      } else if (carHtml.includes("Diesel")) {
        fuelType = "Diesel";
      } else if (carHtml.includes("Electric")) {
        fuelType = "Electric";
      } else if (carHtml.includes("Hybrid")) {
        fuelType = "Hybrid";
      }
      
      // Transmission detection
      let transmission = null;
      if (carHtml.includes("Automatic")) {
        transmission = "Automatic";
      } else if (carHtml.includes("Manual")) {
        transmission = "Manual";
      }
      
      // Location extraction
      const locationMatch = carHtml.match(/<div[^>]*class="[^"]*vehicle-list-item-location[^"]*"[^>]*>(.*?)<\/div>/s);
      const location = locationMatch ? cleanText(locationMatch[1]) : null;
      
      cars.push({
        title,
        price,
        year,
        mileage,
        fuel_type: fuelType,
        transmission,
        location,
        image_url: imageUrl,
        external_url: externalUrl
      });
    }
    
    console.log(`Successfully parsed ${cars.length} cars`);
  } catch (error) {
    console.error("Error parsing HTML:", error);
  }
  
  // If we couldn't parse any cars or encountered an error, return a fallback car
  if (cars.length === 0) {
    console.log("No cars parsed, adding fallback data");
    // Add at least one fallback car so we know the scraper ran
    cars.push({
      title: "Parsing Error - Please check logs",
      price: 0,
      year: new Date().getFullYear(),
      mileage: null,
      fuel_type: null,
      transmission: null,
      location: null,
      image_url: null,
      external_url: "https://www.openlane.eu/en/vehicles"
    });
  }
  
  return cars;
}

function cleanText(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}
