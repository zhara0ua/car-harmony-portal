
export interface AuctionCar {
  id?: number;
  external_id: string;
  title: string;
  start_price: number;
  current_price?: number;
  year: number;
  make?: string;
  model?: string;
  mileage?: string;
  fuel_type?: string;
  transmission?: string;
  location?: string;
  image_url?: string;
  external_url: string;
  end_date: string;
  status?: string;
}

export interface AuctionFilters {
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  make?: string;
  model?: string;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: string;
  transmission?: string;
}
