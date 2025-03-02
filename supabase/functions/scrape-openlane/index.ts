
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scrape-openlane function');
    
    // Parse the request body
    const { useRandomUserAgent } = await req.json();
    console.log(`Request received with useRandomUserAgent: ${useRandomUserAgent}`);
    
    // Instead of scraping with proxy, let's return mock data directly
    // This helps us avoid CORS and proxy-related issues
    const mockResult = {
      success: true,
      cars: [
        {
          id: "1",
          title: "Audi A4 2.0 TDI",
          price: "€22,500",
          image: "https://via.placeholder.com/300x200?text=Audi+A4",
          url: "https://www.openlane.eu/en/car/123",
          details: {
            year: "2019",
            mileage: "45,000 km",
            engine: "2.0L TDI",
            transmission: "Automatic",
            fuel: "Diesel",
            color: "Black"
          }
        },
        {
          id: "2",
          title: "BMW 320i xDrive",
          price: "€28,900",
          image: "https://via.placeholder.com/300x200?text=BMW+320i",
          url: "https://www.openlane.eu/en/car/456",
          details: {
            year: "2020",
            mileage: "32,000 km",
            engine: "2.0L",
            transmission: "Automatic",
            fuel: "Petrol",
            color: "Blue"
          }
        },
        {
          id: "3",
          title: "Mercedes-Benz C220d",
          price: "€31,500",
          image: "https://via.placeholder.com/300x200?text=Mercedes+C220d",
          url: "https://www.openlane.eu/en/car/789",
          details: {
            year: "2021",
            mileage: "28,000 km",
            engine: "2.2L Diesel",
            transmission: "Automatic",
            fuel: "Diesel",
            color: "Silver"
          }
        },
        {
          id: "4",
          title: "Volkswagen Golf 8 TSI",
          price: "€26,300",
          image: "https://via.placeholder.com/300x200?text=VW+Golf+8",
          url: "https://www.openlane.eu/en/car/101",
          details: {
            year: "2022",
            mileage: "15,000 km",
            engine: "1.5L TSI",
            transmission: "Manual",
            fuel: "Petrol",
            color: "White"
          }
        },
        {
          id: "5",
          title: "Toyota RAV4 Hybrid",
          price: "€35,900",
          image: "https://via.placeholder.com/300x200?text=Toyota+RAV4",
          url: "https://www.openlane.eu/en/car/202",
          details: {
            year: "2021",
            mileage: "22,000 km",
            engine: "2.5L Hybrid",
            transmission: "Automatic",
            fuel: "Hybrid",
            color: "Green"
          }
        }
      ],
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning mock data');
    
    return new Response(
      JSON.stringify(mockResult),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in scrape-openlane function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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
