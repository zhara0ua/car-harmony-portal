
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface RawAuctionCar {
  title?: string;
  make?: string;
  model?: string;
  price?: number | string;
  priceFormatted?: string;
  fuel?: string;
  transmission?: string;
  mileage?: number | string;
  mileageFormatted?: string;
  imageSrc?: string;
  detailUrl?: string;
  year?: string | number;
  country?: string;
  auctionId?: string;
  endTime?: string | { fullDate?: string };
}

export interface ProcessedAuctionCar {
  external_id: string;
  title: string;
  start_price: number;
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
  status: string;
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_CARS = 100000; // 100,000 cars

export const processAuctionJsonData = async (content: string) => {
  const jsonData = JSON.parse(content);
  const rawCars = Array.isArray(jsonData) ? jsonData : [jsonData];
  
  if (rawCars.length > MAX_CARS) {
    throw new Error(`Zbyt wiele samochodów w pliku. Maksymalna liczba to ${MAX_CARS}`);
  }
  
  // Filter out invalid cars instead of rejecting the whole file
  const validCars = rawCars.filter(car => car.title && car.detailUrl);
  const skippedCars = rawCars.length - validCars.length;
  
  if (validCars.length === 0) {
    throw new Error("Brak prawidłowych danych samochodów. Wszystkie samochody w pliku muszą posiadać title i detailUrl.");
  }
  
  const processedCars = validCars.map(processSingleCar);
  
  return { cars: processedCars, skippedCars };
};

export const processSingleCar = (car: RawAuctionCar): ProcessedAuctionCar => {
  let price = car.price || 0;
  
  if (typeof price === 'string') {
    price = price.replace(/[^\d.,]/g, '').replace(',', '.');
    price = parseFloat(price) || 0;
  }
  
  if (typeof price === 'number' && price < 100) {
    price = price * 1000;
  }
  
  let endDate;
  try {
    if (!car.endTime) {
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (typeof car.endTime === 'object') {
      if (car.endTime.fullDate) {
        const [datePart, timePart] = car.endTime.fullDate.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');
        endDate = new Date(
          parseInt(year), 
          parseInt(month) - 1, 
          parseInt(day),
          parseInt(hour),
          parseInt(minute)
        ).toISOString();
      } else {
        endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
    } else {
      endDate = new Date(car.endTime).toISOString();
    }
  } catch (error) {
    console.error("Error parsing endTime:", error);
    endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  
  const mileage = typeof car.mileage === 'number' 
    ? car.mileage.toString() 
    : car.mileageFormatted || car.mileage?.toString();
  
  return {
    external_id: car.auctionId || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    title: car.title!,
    start_price: price as number,
    year: parseInt(car.year as string) || new Date().getFullYear(),
    make: car.make,
    model: car.model,
    mileage: mileage,
    fuel_type: car.fuel,
    transmission: car.transmission,
    location: car.country || "Unknown",
    image_url: car.imageSrc,
    external_url: car.detailUrl!,
    end_date: endDate,
    status: "active"
  };
};

export const uploadAuctionCars = async (processedCars: ProcessedAuctionCar[]) => {
  if (processedCars.length > 0) {
    console.log("Deleting existing auction cars...");
    const { error: deleteError } = await supabase
      .from('auction_cars')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.error("Error deleting existing cars:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully deleted existing auction cars");
  }
  
  const BATCH_SIZE = 1000;
  const batches = Math.ceil(processedCars.length / BATCH_SIZE);
  
  console.log(`Inserting ${processedCars.length} cars in ${batches} batches`);
  
  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, processedCars.length);
    const batch = processedCars.slice(start, end);
    
    console.log(`Inserting batch ${i+1}/${batches} (${batch.length} cars)`);
    
    const { error: insertError } = await supabase
      .from('auction_cars')
      .insert(batch);
    
    if (insertError) {
      console.error("Error inserting cars batch:", insertError);
      throw insertError;
    }
  }
  
  console.log("Successfully inserted all auction cars");
  return processedCars.length;
};
