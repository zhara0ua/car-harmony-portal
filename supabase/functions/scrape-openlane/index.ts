
// @ts-ignore // Deno doesn't recognize the Python import
import { python } from "https://deno.land/x/python@0.2.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const pythonCode = `
import requests
from bs4 import BeautifulSoup
import json

def scrape_openlane():
    base_url = "https://www.openlane.eu"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    cars = []
    
    try:
        # Get the main page
        response = requests.get(f"{base_url}/en/search-results", headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        car_listings = soup.find_all('div', class_='vehicle-card')
        
        for car in car_listings:
            try:
                # Extract car details
                title_elem = car.find('h2', class_='vehicle-title')
                price_elem = car.find('div', class_='vehicle-price')
                img_elem = car.find('img', class_='vehicle-image')
                details_elem = car.find('div', class_='vehicle-details')
                
                if not all([title_elem, price_elem]):
                    continue
                
                # Get the details
                title = title_elem.text.strip()
                price_text = price_elem.text.strip().replace('€', '').replace(',', '').strip()
                price = int(float(price_text)) if price_text.replace('.', '').isdigit() else 0
                
                # Get the URL
                url_elem = car.find('a', href=True)
                external_url = base_url + url_elem['href'] if url_elem else ''
                
                # Get the image URL
                image_url = img_elem['src'] if img_elem and 'src' in img_elem.attrs else None
                
                # Extract year from title
                year = None
                if title:
                    year_parts = [part for part in title.split() if part.isdigit() and len(part) == 4]
                    if year_parts:
                        year = int(year_parts[0])
                
                # Extract additional details
                mileage = None
                fuel_type = None
                transmission = None
                location = None
                
                if details_elem:
                    details_text = details_elem.text.strip()
                    details_parts = details_text.split('|')
                    
                    for part in details_parts:
                        part = part.strip()
                        if 'km' in part.lower():
                            mileage = part
                        elif any(fuel in part.lower() for fuel in ['diesel', 'petrol', 'electric', 'hybrid']):
                            fuel_type = part
                        elif any(trans in part.lower() for trans in ['manual', 'automatic']):
                            transmission = part
                
                # Create car object
                car_data = {
                    'external_id': url_elem['href'].split('/')[-1] if url_elem else '',
                    'title': title,
                    'price': price,
                    'year': year,
                    'mileage': mileage,
                    'fuel_type': fuel_type,
                    'transmission': transmission,
                    'location': location,
                    'image_url': image_url,
                    'external_url': external_url,
                    'source': 'openlane'
                }
                
                cars.append(car_data)
                
            except Exception as e:
                print(f"Error processing car: {str(e)}")
                continue
        
        return json.dumps({
            'success': True,
            'data': cars,
            'error': None
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'data': None,
            'error': str(e)
        })

print(scrape_openlane())
    `;

    console.log('Starting OpenLane scraping...');
    
    const result = await python.run(pythonCode);
    console.log('Python script execution completed');
    
    try {
      const jsonResult = JSON.parse(result);
      
      if (!jsonResult.success) {
        throw new Error(jsonResult.error || 'Failed to scrape data');
      }
      
      const { supabaseClient } = await import('./supabaseClient.ts');
      
      // Insert the scraped cars into the database
      if (jsonResult.data && jsonResult.data.length > 0) {
        const { data: insertedData, error: insertError } = await supabaseClient
          .from('scraped_cars')
          .upsert(
            jsonResult.data.map((car: any) => ({
              ...car,
              created_at: new Date().toISOString()
            })),
            { onConflict: 'external_id' }
          );
          
        if (insertError) {
          throw new Error(`Failed to insert cars: ${insertError.message}`);
        }
        
        console.log(`Successfully inserted/updated ${jsonResult.data.length} cars`);
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: `Successfully scraped and stored ${jsonResult.data.length} cars`,
        cars: jsonResult.data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (parseError) {
      console.error('Error parsing Python script output:', parseError);
      throw new Error('Failed to parse scraping results');
    }
    
  } catch (error) {
    console.error('Error in OpenLane scraper:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
