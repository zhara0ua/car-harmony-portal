
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrapedCarsFilters } from "@/components/scraped-cars/ScrapedCarsFilters";
import { ScrapedCarCard } from "@/components/scraped-cars/ScrapedCarCard";
import { useCarScraping } from "@/hooks/use-car-scraping";
import { type Filters, type ScrapedCar } from "@/types/scraped-car";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ScrapedCars() {
  const [filters, setFilters] = useState<Filters>({});
  const { startScraping } = useCarScraping();
  
  const { data: cars, isLoading, error } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      console.log('Fetching cars with filters:', filters);
      let query = supabase
        .from('scraped_cars')
        .select('*') as any;
      
      if (filters.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.fuelType) {
        query = query.eq('fuel_type', filters.fuelType);
      }
      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission);
      }

      const { data, error } = await query;
      console.log('Fetched cars:', data);
      if (error) {
        console.error('Error fetching cars:', error);
        throw error;
      }
      return data as ScrapedCar[];
    }
  });

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    console.log('Applying new filters:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (error) {
    console.error('Error in ScrapedCars component:', error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Автомобілі з CarOutlet</h1>
            <Button onClick={startScraping} variant="default">
              Оновити дані
            </Button>
          </div>

          <ScrapedCarsFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Завантаження...</p>
            </div>
          ) : !cars?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Немає доступних автомобілів
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <ScrapedCarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
