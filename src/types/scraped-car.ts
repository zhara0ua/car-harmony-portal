
export interface ScrapedCar {
  id: number;
  external_id: string;
  title: string;
  price: number;
  year: number;
  mileage: string;
  fuel_type: string;
  transmission: string;
  location: string;
  image_url: string;
  external_url: string;
  source: string;
}

export interface Filters {
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
}
