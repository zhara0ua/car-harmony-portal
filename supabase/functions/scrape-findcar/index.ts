
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client to access secrets
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get proxy list from supabase secrets
    const proxyListSecret = Deno.env.get("PROXY_LIST") || "";
    const proxyList = proxyListSecret ? proxyListSecret.split(',').map(proxy => proxy.trim()) : [];
    
    console.log(`Loaded ${proxyList.length} proxies from environment variables`);
    
    const { url, useProxy } = await req.json();
    
    // Default URL if none provided
    const targetUrl = url || "https://car-from-usa.com/search/?page=1";
    
    console.log(`Scraping URL: ${targetUrl}`);
    console.log(`Use proxy: ${useProxy}`);

    // Function to get a random proxy from the list
    const getRandomProxy = () => {
      if (!proxyList.length) return null;
      const randomIndex = Math.floor(Math.random() * proxyList.length);
      return proxyList[randomIndex];
    };

    // Use a random proxy if useProxy is true and proxy list is not empty
    const randomProxy = useProxy && proxyList.length > 0 ? getRandomProxy() : null;
    
    if (useProxy && randomProxy) {
      console.log(`Using proxy: ${randomProxy}`);
    } else if (useProxy && !randomProxy) {
      console.log("Proxy requested but no proxies available, proceeding without proxy");
    }

    // Fetch HTML content
    const fetchOptions: RequestInit = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    };

    // Add proxy if available and requested
    if (useProxy && randomProxy) {
      fetchOptions.client = "proxy";
      fetchOptions.proxyUrl = randomProxy;
    }

    console.log("Fetching HTML content...");
    const response = await fetch(targetUrl, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML content (${html.length} bytes)`);

    // Parse HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML document");
    }

    // Extract car data (simplified example - actual parsing would be more complex)
    const carElements = document.querySelectorAll(".vehicle-card");
    console.log(`Found ${carElements.length} car elements`);

    // Mock data for testing, in a real implementation you would parse the HTML
    const cars = Array.from(carElements).map((element, index) => {
      // Extract fields from HTML elements - this is simplified
      const name = element.querySelector(".vehicle-name")?.textContent || `Car ${index + 1}`;
      const makeModel = name.split(' ').slice(0, 2);
      const make = makeModel[0] || "Unknown";
      const model = makeModel[1] || "Model";
      
      const priceElement = element.querySelector(".vehicle-price");
      const priceText = priceElement?.textContent || "$0";
      const price = priceText.replace(/[^\d]/g, "");
      
      const imageElement = element.querySelector("img");
      const image = imageElement?.getAttribute("src") || "https://via.placeholder.com/150";

      return {
        id: index + 1,
        name,
        make,
        model,
        price: priceText,
        price_number: parseInt(price) || 0,
        year: 2020 + (index % 5),
        mileage: `${(Math.floor(Math.random() * 100) + 10)}k mi`,
        category: ["SUV", "Sedan", "Truck", "Coupe"][index % 4],
        transmission: ["Automatic", "Manual"][index % 2],
        fuel_type: ["Gasoline", "Diesel", "Hybrid", "Electric"][index % 4],
        engine_size: `${(Math.floor(Math.random() * 5) + 1)}.${Math.floor(Math.random() * 9)}L`,
        engine_power: `${(Math.floor(Math.random() * 300) + 100)} HP`,
        url: targetUrl,
        image
      };
    });

    // Return response with CORS headers
    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully scraped car data",
        cars: cars.length > 0 ? cars : [],
        timestamp: new Date().toISOString(),
        proxyUsed: useProxy && randomProxy ? true : false
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in scrape-findcar function:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message}`,
        cars: [],
        timestamp: new Date().toISOString(),
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
