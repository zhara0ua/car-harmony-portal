
export interface AuctionCar {
  id?: number;
  external_id?: string;
  title: string;
  make?: string;
  model?: string;
  start_price: number;
  current_price?: number;
  year: number | string;
  mileage?: string | number;
  fuel_type?: string;
  transmission?: string;
  location?: string;
  image_url?: string;
  external_url: string;
  end_date: string;
  created_at?: string;
  status?: string;
  // Additional fields from the JSON structure
  priceFormatted?: string;
  mileageFormatted?: string;
  power?: string;
  bodyType?: string;
  vatStatus?: string;
  country?: string;
  emissions?: string;
  timestamp?: string;
  auctionType?: string;
  premiumOffers?: string[];
  endTime?: string | null;
  photoCount?: number;
}

export interface AuctionFilters {
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  make?: string;
  model?: string;
  fuelType?: string;
  minMileage?: number;
  maxMileage?: number;
}
