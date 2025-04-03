
import { cleanHtml, extractBasicCarInfo, extractCarDetails, extractMakeAndModel, generateExternalId, generateRandomEndDate } from "./helpers";

export interface ParsedCar {
  external_id: string;
  title: string;
  start_price: number;
  current_price: number;
  year: number;
  make: string;
  model: string;
  mileage: string;
  fuel_type: string;
  transmission: string;
  location: string;
  image_url: string | null;
  external_url: string;
  end_date: string;
  status: string;
}

/**
 * Parses HTML content to extract car information
 */
export function parseHtmlForCars(htmlContent: string): ParsedCar[] {
  const cars: ParsedCar[] = [];
  const carCardRegex = /<div[^>]*class="vehicle-card"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  
  let matches;
  let index = 0;
  
  while ((matches = carCardRegex.exec(htmlContent)) !== null && index < 20) {
    try {
      const cardHtml = matches[1];
      
      // Extract basic car information
      const { title, price, imageUrl, externalUrl } = extractBasicCarInfo(cardHtml);
      
      // Skip if no title or external URL
      if (!title || !externalUrl) {
        console.log(`Car #${index + 1} has missing required data, skipping`);
        continue;
      }
      
      // Extract car details
      const detailsMatch = cardHtml.match(/<div[^>]*class="vehicle-card__details"[^>]*>([\s\S]*?)<\/div>/);
      const detailsHtml = detailsMatch ? detailsMatch[1] : '';
      
      const { year, mileage, fuel, transmission } = extractCarDetails(detailsHtml);
      
      // Extract make and model from title
      const { make, model } = extractMakeAndModel(title);
      
      // Generate unique ID and end date
      const externalId = generateExternalId(index);
      const endDate = generateRandomEndDate();
      
      cars.push({
        external_id: externalId,
        title: title,
        start_price: price,
        current_price: price,
        year,
        make,
        model,
        mileage,
        fuel_type: fuel,
        transmission,
        location: 'Openlane EU',
        image_url: imageUrl,
        external_url: externalUrl,
        end_date: endDate,
        status: 'active'
      });
      
      index++;
    } catch (e) {
      console.error('Error parsing car card:', e);
    }
  }
  
  return cars;
}
