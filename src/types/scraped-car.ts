
export interface ScrapedCar {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  details: ScrapedCarDetails;
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
}
