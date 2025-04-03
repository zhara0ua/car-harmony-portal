
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCar } from "@/types/auction-car";

export const useAuctionCars = () => {
  const { 
    data: cars, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['admin-auction-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_cars')
        .select('*')
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      
      // Convert numeric prices to numbers for consistent handling in the UI
      const formattedData = data.map(car => ({
        ...car,
        start_price: Number(car.start_price),
        current_price: car.current_price ? Number(car.current_price) : undefined
      }));
      
      return formattedData as AuctionCar[];
    }
  });

  return { cars, isLoading, refetch };
};
