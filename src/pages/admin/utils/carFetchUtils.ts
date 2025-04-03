
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Car } from "../types/car";

export const fetchCars = async () => {
  try {
    console.log("Fetching cars...");
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }

    console.log("Fetched cars:", data);

    const formattedCars = data?.map(car => ({
      ...car,
      price: car.price || `${car.price_number.toLocaleString()} zł`,
      mileage: car.mileage || `${car.mileage} km.`
    })) || [];

    return formattedCars;
  } catch (error) {
    console.error('Error fetching cars:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося завантажити список автомобілів",
      variant: "destructive",
    });
    return [];
  }
};
