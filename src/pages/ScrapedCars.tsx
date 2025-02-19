
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
  
  const { data: cars, isLoading } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      const query = supabase
        .from('scraped_cars')
        .select('*') as any;
      
      if (filters.minYear) {
        query.gte('year', filters.minYear);
      }
      if (filters.maxYear) {
        query.lte('year', filters.maxYear);
      }
      if (filters.minPrice) {
        query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query.lte('price', filters.maxPrice);
      }
      if (filters.fuelType) {
        query.eq('fuel_type', filters.fuelType);
      }
      if (filters.transmission) {
        query.eq('transmission', filters.transmission);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScrapedCar[];
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Автомобілі з CarOutlet</h1>
            <Button onClick={startScraping}>
              Оновити дані
            </Button>
          </div>

          <ScrapedCarsFilters onFilterChange={setFilters} />

          {isLoading ? (
            <div className="text-center">Завантаження...</div>
          ) : !cars?.length ? (
            <div className="text-center text-muted-foreground">
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
