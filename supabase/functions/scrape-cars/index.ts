
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

// Helper function to extract text content from HTML element
function extractTextFromElement(html: string, selector: string): string | null {
  const pattern = new RegExp(`<${selector}[^>]*>(.*?)</${selector.split(' ')[0]}>`, 'is');
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : null;
}

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
    
    // First, let's try to find car containers with multiple patterns
    const patternVariants = [
      /<div[^>]*class="[^"]*car-list-item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g,
      /<div[^>]*class="[^"]*vehicle-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g,
      /<article[^>]*class="[^"]*car-item[^"]*"[^>]*>([\s\S]*?)<\/article>/g,
      /<div[^>]*class="[^"]*item-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g,
      /<li[^>]*class="[^"]*car-listing[^"]*"[^>]*>([\s\S]*?)<\/li>/g
    ];
    
    const cars = [];
    let foundListings = false;
    
    // Try each pattern variant
    for (const pattern of patternVariants) {
      const listingMatches = [...html.matchAll(pattern)];
      
      if (listingMatches.length > 0) {
        foundListings = true;
        console.log(`Found ${listingMatches.length} car listings with pattern: ${pattern}`);
        
        // Process each car listing (limited to 20 for performance)
        for (let i = 0; i < Math.min(listingMatches.length, 20); i++) {
          try {
            const listingHtml = listingMatches[i][0];
            
            // Generate a unique ID based on timestamp and index
            const timestamp = Date.now();
            const externalId = `co-${timestamp}-${i+1}`;
            
            // Extract URL using a more flexible pattern
            let externalUrl = null;
            const urlMatches = listingHtml.match(/href="([^"]+)"/g);
            if (urlMatches && urlMatches.length > 0) {
              // Extract the first URL (likely the car details link)
              const urlMatch = urlMatches[0].match(/href="([^"]+)"/);
              const relativeUrl = urlMatch ? urlMatch[1] : "";
              externalUrl = relativeUrl.startsWith("http") ? relativeUrl : `https://caroutlet.eu${relativeUrl}`;
            }
            
            // Extract title - try multiple patterns
            let title = null;
            const titlePatterns = [
              /<h2[^>]*>([\s\S]*?)<\/h2>/i,
              /<h3[^>]*>([\s\S]*?)<\/h3>/i,
              /<div[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
              /<div[^>]*class="[^"]*name[^"]*"[^>]*>([\s\S]*?)<\/div>/i
            ];
            
            for (const titlePattern of titlePatterns) {
              const titleMatch = listingHtml.match(titlePattern);
              if (titleMatch) {
                title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
                break;
              }
            }
            
            // If no title was found, try to find any text in the listing
            if (!title) {
              // Extract all text content
              const textContent = listingHtml.replace(/<[^>]*>/g, ' ')
                                            .replace(/\s+/g, ' ')
                                            .trim();
              
              // Use first 50 characters as title if available
              title = textContent.length > 0 ? 
                      textContent.substring(0, Math.min(50, textContent.length)) : 
                      "Unknown Vehicle";
            }
            
            // Extract price - try multiple patterns
            let price = 0;
            const pricePatterns = [
              /[^\d](\d{1,3}(?:\s?\d{3})*)\s*(?:PLN|zł|€|EUR)/i,
              /(\d{1,3}(?:\s?\d{3})*)\s*(?:PLN|zł|€|EUR)/i,
              /<div[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
              /<span[^>]*class="[^"]*price[^"]*"[^>]*>([\s\S]*?)<\/span>/i
            ];
            
            for (const pricePattern of pricePatterns) {
              const priceMatch = listingHtml.match(pricePattern);
              if (priceMatch) {
                const priceText = priceMatch[1].replace(/\s/g, '');
                price = parseInt(priceText.replace(/\D/g, '')) || 0;
                break;
              }
            }
            
            // Extract year from title or elsewhere in the listing
            let year = null;
            const yearMatch = listingHtml.match(/\b(20\d{2}|19\d{2})\b/);
            if (yearMatch) {
              year = parseInt(yearMatch[1]);
            }
            
            // Extract image URL - try multiple patterns
            let imageUrl = null;
            const imgPatterns = [
              /src="([^"]+\.jpg|[^"]+\.png|[^"]+\.jpeg)"/i,
              /data-src="([^"]+\.jpg|[^"]+\.png|[^"]+\.jpeg)"/i,
              /data-lazy="([^"]+\.jpg|[^"]+\.png|[^"]+\.jpeg)"/i
            ];
            
            for (const imgPattern of imgPatterns) {
              const imgMatches = [...listingHtml.matchAll(imgPattern)];
              if (imgMatches.length > 0) {
                // Use the first image found
                imageUrl = imgMatches[0][1];
                break;
              }
            }
            
            // Extract mileage
            let mileage = null;
            const mileagePatterns = [
              /(\d+[\s.]?\d*)\s*km/i,
              /(\d+[\s.]?\d*)\s*mil/i,
              /(\d+[\s.]?\d*)\s*tys\.?\s*km/i
            ];
            
            for (const mileagePattern of mileagePatterns) {
              const mileageMatch = listingHtml.match(mileagePattern);
              if (mileageMatch) {
                mileage = mileageMatch[1].trim() + " km";
                break;
              }
            }
            
            // Look for fuel type
            let fuelType = null;
            const fuelTypePatterns = {
              "Petrol": /benzyna|gasoline|petrol/i,
              "Diesel": /diesel|olej/i,
              "Hybrid": /hybrid|hybryda/i,
              "Electric": /electric|elektryczny/i,
              "Gas": /gas|lpg|cng/i
            };
            
            for (const [type, pattern] of Object.entries(fuelTypePatterns)) {
              if (pattern.test(listingHtml)) {
                fuelType = type;
                break;
              }
            }
            
            // Look for transmission
            let transmissionType = null;
            if (/automat|automatic/i.test(listingHtml)) {
              transmissionType = "Automatic";
            } else if (/manualna|manual/i.test(listingHtml)) {
              transmissionType = "Manual";
            }
            
            // Extract location 
            let location = null;
            const locationPatterns = [
              /location[^>]*>([\s\S]*?)<\//i,
              /address[^>]*>([\s\S]*?)<\//i,
              /miasto[^>]*>([\s\S]*?)<\//i
            ];
            
            for (const locationPattern of locationPatterns) {
              const locationMatch = listingHtml.match(locationPattern);
              if (locationMatch) {
                location = locationMatch[1].replace(/<[^>]*>/g, '').trim();
                break;
              }
            }
            
            cars.push({
              external_id: externalId,
              title: title || "Unknown Vehicle",
              price: price || 0,
              year: year || new Date().getFullYear(),
              mileage: mileage || "Unknown",
              fuel_type: fuelType,
              transmission: transmissionType,
              location: location,
              image_url: imageUrl,
              external_url: externalUrl || CAR_OUTLET_URL,
              source: "caroutlet"
            });
          } catch (itemError) {
            console.error(`Error parsing car listing #${i}:`, itemError);
          }
        }
        
        // If we found listings with this pattern, no need to try others
        break;
      }
    }
    
    // If we couldn't find any listings with our patterns, analyze the HTML structure
    if (!foundListings) {
      console.log("No cars found with predefined patterns. Analyzing HTML structure...");
      
      // Look for common car listing indicators
      const possibleCarElements = [
        ... html.matchAll(/<div[^>]*class="[^"]*(?:car|vehicle|auto|product|item)[^"]*"[^>]*>/g)
      ];
      
      console.log(`Found ${possibleCarElements.length} potential car elements`);
      
      // Debug HTML structure for future pattern adjustments
      console.log("HTML sample for debugging:");
      console.log(html.substring(0, 5000));
      
      // Still return mock data as we couldn't extract real listings
      return {
        cars: MOCK_CARS,
        usedMockData: true,
        message: "Couldn't identify car listings in the HTML. The website structure may have changed. Check logs for details."
      };
    }
    
    console.log(`Successfully scraped ${cars.length} cars`);
    
    return {
      cars: cars.length > 0 ? cars : MOCK_CARS,
      usedMockData: cars.length === 0,
      message: cars.length > 0 ? 
        `Successfully scraped ${cars.length} cars from CarOutlet` :
        "No cars found, using mock data. The website structure may have changed."
    };
  } catch (error) {
    console.error("Error during scraping:", error);
    
    // Return mock data with error information
    return {
      cars: MOCK_CARS,
      usedMockData: true,
      error: error.message || "Unknown error",
      message: `Scraping error: ${error.message}. Using mock data instead.`
    };
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
      const scrapingResult = await scrapeCarOutlet();
      
      // Prepare the response based on the scraping result
      const response = {
        success: scrapingResult.error ? false : true,
        message: scrapingResult.message || (scrapingResult.usedMockData ? 
          "Scraping encountered issues, using fallback data" : 
          `Successfully scraped ${scrapingResult.cars.length} cars`),
        error: scrapingResult.error,
        cars: scrapingResult.cars || []
      };
      
      return new Response(
        JSON.stringify(response),
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
          error: scrapingError.stack || "No stack trace available",
          cars: MOCK_CARS
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`,
        error: error.stack || "No stack trace available",
        cars: MOCK_CARS
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
