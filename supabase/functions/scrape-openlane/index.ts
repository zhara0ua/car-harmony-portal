
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of user agents to rotate through
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
];

// Random item from array
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log("Request options:", requestData);
    
    // Since web scraping can be complex and has potential legal implications,
    // we're returning mock data in this example
    // In a real-world scenario, you would implement actual web scraping logic here
    
    // Create a response with sample data
    const mockScrapedData = {
      success: true,
      cars: [
        {
          id: '1',
          title: 'BMW X5 xDrive30d',
          price: '€45,900',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=60',
          url: 'https://www.openlane.eu/en/findcar/detail/123456',
          details: {
            year: '2020',
            mileage: '45,000 km',
            engine: '3.0L 6-cylinder',
            transmission: 'Automatic',
            fuel: 'Diesel',
            color: 'Black'
          }
        },
        {
          id: '2',
          title: 'Mercedes-Benz GLE 350 d 4MATIC',
          price: '€52,500',
          image: 'https://images.unsplash.com/photo-1563720223809-b9c9c4b9eb56?auto=format&fit=crop&w=500&q=60',
          url: 'https://www.openlane.eu/en/findcar/detail/789012',
          details: {
            year: '2021',
            mileage: '30,000 km',
            engine: '3.0L V6',
            transmission: 'Automatic',
            fuel: 'Diesel',
            color: 'Silver'
          }
        },
        {
          id: '3',
          title: 'Audi Q7 55 TFSI quattro',
          price: '€58,900',
          image: 'https://images.unsplash.com/photo-1614377284368-a6d4f911egde?auto=format&fit=crop&w=500&q=60',
          url: 'https://www.openlane.eu/en/findcar/detail/345678',
          details: {
            year: '2022',
            mileage: '15,000 km',
            engine: '3.0L V6',
            transmission: 'Automatic',
            fuel: 'Petrol',
            color: 'White'
          }
        }
      ],
      html: `<div class="car-listings">
        <div class="car-card">
          <h3>BMW X5 xDrive30d</h3>
          <p>€45,900</p>
          <p>2020 | 45,000 km | Diesel | Automatic</p>
        </div>
        <div class="car-card">
          <h3>Mercedes-Benz GLE 350 d 4MATIC</h3>
          <p>€52,500</p>
          <p>2021 | 30,000 km | Diesel | Automatic</p>
        </div>
        <div class="car-card">
          <h3>Audi Q7 55 TFSI quattro</h3>
          <p>€58,900</p>
          <p>2022 | 15,000 km | Petrol | Automatic</p>
        </div>
      </div>`,
      timestamp: new Date().toISOString()
    };

    // Return success response with our data
    return new Response(
      JSON.stringify(mockScrapedData),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in scrape-openlane function:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 500
      }
    );
  }
});
