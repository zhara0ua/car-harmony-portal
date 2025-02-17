
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Car {
  id: number;
  image: string;
  name: string;
  make: string;
  model: string;
  price: string;
  price_number: number;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  created_at: string;
}

interface UseCarFilters {
  category: string;
  transmission: string;
  fuelType: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

export const useCars = (filters: UseCarFilters) => {
  const [cars, setCars] = useState<Car[]>([]);
  const { toast } = useToast();

  const fetchCars = async () => {
    try {
      let query = supabase
        .from('cars')
        .select('*');

      if (filters.category !== "all") {
        query = query.eq('category', filters.category);
      }
      if (filters.transmission !== "all") {
        query = query.eq('transmission', filters.transmission);
      }
      if (filters.fuelType !== "all") {
        query = query.eq('fuel_type', filters.fuelType);
      }
      if (filters.make !== "all") {
        query = query.eq('make', filters.make);
      }
      if (filters.model !== "all") {
        query = query.eq('model', filters.model);
      }
      if (filters.minPrice) {
        query = query.gte('price_number', parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price_number', parseInt(filters.maxPrice));
      }

      switch (filters.sortBy) {
        case "price-asc":
          query = query.order('price_number', { ascending: true });
          break;
        case "price-desc":
          query = query.order('price_number', { ascending: false });
          break;
        case "year-desc":
          query = query.order('year', { ascending: false });
          break;
        case "year-asc":
          query = query.order('year', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити список автомобілів",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCars();
  }, [
    filters.category,
    filters.transmission,
    filters.fuelType,
    filters.make,
    filters.model,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy
  ]);

  return { cars };
};
