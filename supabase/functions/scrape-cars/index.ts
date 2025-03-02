
// Import required modules from Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Constants for scraping
const CAR_OUTLET_URL = "https://caroutlet.eu/pl/samochody";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

// Mock data as fallback if scraping fails
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
    source: "caroutlet"
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
    source: "caroutlet"
  }
];

// Function to extract car data from HTML
async function scrapeCarOutlet() {
  console.log("Starting Car Outlet scraper with fetch...");
  
  try {
    // Make request to the website
    const response = await fetch(CAR_OUTLET_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`Received ${html.length} bytes of HTML`);
    
    // Use regex to extract car listings
    const cars = [];
    
    // Pattern to find car listings
    const carListingPattern = /<div[^>]*class="[^"]*car-list-item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
    let listingMatch;
    let counter = 0;
    
    while ((listingMatch = carListingPattern.exec(html)) !== null && counter < 10) { // Limit to 10 cars for efficiency
      try {
        const listingHtml = listingMatch[0];
        
        // Extract car ID
        const idMatch = listingHtml.match(/data-id="([^"]+)"/);
        const externalId = idMatch ? idMatch[1] : `unknown-${counter}`;
        
        // Extract car URL
        const urlMatch = listingHtml.match(/href="([^"]+)"/);
        const relativeUrl = urlMatch ? urlMatch[1] : "";
        const externalUrl = relativeUrl.startsWith("http") ? relativeUrl : `https://caroutlet.eu${relativeUrl}`;
        
        // Extract car title
        const titleMatch = listingHtml.match(/<h2[^>]*class="[^"]*car-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : "Unknown Model";
        
        // Extract price
        const priceMatch = listingHtml.match(/class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/div>/);
        const priceText = priceMatch ? priceMatch[1].replace(/<[^>]*>/g, '').trim() : "0";
        const price = parseInt(priceText.replace(/\D/g, '')) || 0;
        
        // Extract year
        const yearMatch = title.match(/\b(20\d{2}|19\d{2})\b/); // Match 4-digit years (1900-2099)
        const year = yearMatch ? parseInt(yearMatch[1]) : null;
        
        // Extract image URL
        const imageMatch = listingHtml.match(/src="([^"]+\.jpg|[^"]+\.png)"/);
        const imageUrl = imageMatch ? imageMatch[1] : null;
        
        // Extract other details from the listing
        // Mileage (example pattern looking for km in text)
        const mileageMatch = listingHtml.match(/(\d+[\s.]?\d*)\s*km/i);
        const mileage = mileageMatch ? mileageMatch[1].trim() + " km" : null;
        
        // Look for fuel type
        const fuelTypePatterns = {
          "Petrol": /benzyna|gasoline|petrol/i,
          "Diesel": /diesel|olej/i,
          "Hybrid": /hybrid|hybryda/i,
          "Electric": /electric|elektryczny/i
        };
        
        let fuelType = null;
        for (const [type, pattern] of Object.entries(fuelTypePatterns)) {
          if (pattern.test(listingHtml)) {
            fuelType = type;
            break;
          }
        }
        
        // Look for transmission
        const transmissionType = /automatyczna|automatic/i.test(listingHtml) ? "Automatic" : 
                               /manualna|manual/i.test(listingHtml) ? "Manual" : null;
        
        // Extract location (more complex, may need refinement)
        const locationMatch = listingHtml.match(/location[^>]*>([\s\S]*?)<\/div>/i);
        const location = locationMatch ? locationMatch[1].replace(/<[^>]*>/g, '').trim() : null;
        
        cars.push({
          external_id: externalId,
          title,
          price,
          year,
          mileage,
          fuel_type: fuelType,
          transmission: transmissionType,
          location,
          image_url: imageUrl,
          external_url: externalUrl,
          source: "caroutlet"
        });
        
        counter++;
      } catch (itemError) {
        console.error(`Error parsing car listing ${counter}:`, itemError);
      }
    }
    
    if (cars.length === 0) {
      console.log("No cars found in the HTML, pattern might need adjustment");
      return MOCK_CARS;
    }
    
    console.log(`Successfully scraped ${cars.length} cars`);
    return cars;
  } catch (error) {
    console.error("Error during scraping:", error);
    // Return mock data as fallback
    return MOCK_CARS;
  }
}

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
      console.log("Returning mock data as requested");
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

    // For real data, use our JavaScript scraper
    try {
      console.log("Starting JavaScript scraper...");
      const scrapedCars = await scrapeCarOutlet();
      
      if (scrapedCars.length === 0) {
        console.log("No cars found, returning message");
        return new Response(
          JSON.stringify({
            success: false,
            message: "No cars found during scraping",
            cars: []
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      if (scrapedCars === MOCK_CARS) {
        console.log("Scraping failed, returning mock data with notice");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Scraping encountered issues, using fallback data. The scraper may need updating to match the website's current structure.",
            cars: scrapedCars
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      console.log(`Successfully scraped ${scrapedCars.length} cars`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully scraped ${scrapedCars.length} cars from CarOutlet`,
          cars: scrapedCars
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (scrapingError) {
      console.error("Error during JavaScript scraping:", scrapingError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error during scraping: ${scrapingError.message || "Unknown error"}`,
          error: scrapingError.stack || "No stack trace available"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
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
