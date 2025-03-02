
// These empty interfaces are provided to fix type errors in components that can't be modified
// The scraping functionality has been removed from the application

export interface ScrapedCar {
  id?: string;
  title?: string;
  price?: string | number;
  image?: string;
  image_url?: string;
  year?: string | number;
  mileage?: string;
  location?: string;
  transmission?: string;
  engine?: string;
  url?: string;
  external_url?: string;
  external_id?: string;
  fuel_type?: string;
  source?: string;
}

export interface Filters {
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  fuelType?: string;
  transmission?: string;
}
