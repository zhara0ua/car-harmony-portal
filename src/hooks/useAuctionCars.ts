
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
      return data as AuctionCar[];
    }
  });

  return { cars, isLoading, refetch };
};
