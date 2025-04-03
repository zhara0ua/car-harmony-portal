
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCar } from "@/types/auction-car";

export type SortField = 'end_date' | 'start_price' | 'year' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export const useAuctionCars = (sortOptions?: SortOptions) => {
  const fetchAllCars = async (): Promise<AuctionCar[]> => {
    const PAGE_SIZE = 1000; // Supabase's max rows per request
    let allCars: AuctionCar[] = [];
    let page = 0;
    let hasMore = true;
    
    console.log('Starting to fetch all auction cars');
    console.log('Sorting by:', sortOptions?.field, sortOptions?.order);
    
    // Default sort field and order
    const sortField = sortOptions?.field || 'end_date';
    const sortOrder = sortOptions?.order || 'asc';
    
    while (hasMore) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      console.log(`Fetching page ${page + 1}, rows ${from} to ${to}`);
      
      const { data, error, count } = await supabase
        .from('auction_cars')
        .select('*', { count: 'exact' })
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(from, to);
      
      if (error) {
        console.error('Error fetching auction cars:', error);
        throw error;
      }
      
      if (data.length === 0) {
        hasMore = false;
      } else {
        // Convert numeric prices to numbers for consistent handling in the UI
        const formattedData = data.map(car => ({
          ...car,
          start_price: Number(car.start_price),
          current_price: car.current_price ? Number(car.current_price) : undefined
        }));
        
        allCars = [...allCars, ...formattedData];
        page++;
        
        // Check if we should continue fetching
        hasMore = count !== null && allCars.length < count;
        console.log(`Fetched ${allCars.length} of ${count} total cars`);
      }
    }
    
    return allCars as AuctionCar[];
  };

  const { 
    data: cars, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['admin-auction-cars', sortOptions],
    queryFn: fetchAllCars
  });

  return { cars, isLoading, refetch };
};
