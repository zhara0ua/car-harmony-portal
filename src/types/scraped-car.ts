
export interface ScrapedCar {
  id: number;
  external_id: string;
  title: string;
  price: number;
  year: number;
  mileage: string | null;
  fuel_type: string | null;
  transmission: string | null;
  location: string | null;
  image_url: string | null;
  external_url: string;
  source: string;
  created_at?: string;
}

export interface Filters {
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  source?: string;
}
