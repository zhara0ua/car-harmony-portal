
// These empty interfaces are provided to fix type errors in components that can't be modified
// The scraping functionality has been removed from the application

export interface ScrapedCar {
  id?: string;
  title?: string;
  price?: string;
  image?: string;
  year?: string;
  mileage?: string;
  location?: string;
  transmission?: string;
  engine?: string;
  url?: string;
}

export interface Filters {
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
}
