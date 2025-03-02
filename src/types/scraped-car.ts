
export interface ScrapedCar {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  details: ScrapedCarDetails;
  
  // Additional properties for the form component
  external_id?: string;
  year?: number;
  mileage?: string;
  fuel_type?: string;
  transmission?: string;
  location?: string;
  image_url?: string;
  external_url?: string;
  source?: string;
}

export interface ScrapedCarDetails {
  year?: string;
  mileage?: string;
  engine?: string;
  transmission?: string;
  fuel?: string;
  color?: string;
}

export interface ScraperResult {
  success: boolean;
  cars?: ScrapedCar[];
  html?: string;
  error?: string;
  timestamp?: string;
  note?: string; // Added this property to fix the TypeScript errors
}
