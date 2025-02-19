import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrapedCarCard } from "@/components/scraped-cars/ScrapedCarCard";
import { ScrapedCarsFilters } from "@/components/scraped-cars/ScrapedCarsFilters";
import { ScrapedCarForm } from "@/components/scraped-cars/ScrapedCarForm";
import { useToast } from "@/components/ui/use-toast";
import { type Filters, type ScrapedCar } from "@/types/scraped-car";
import { triggerScraping } from "@/utils/scraping";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ScrapedCars() {
  const [filters, setFilters] = useState<Filters>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const { toast } = useToast();
  
  const { data: cars, isLoading, error, refetch } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      let query = supabase
        .from('scraped_cars')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      if (error) throw error;
      return data as ScrapedCar[];
    }
  });

  const handleScraping = async () => {
    try {
      setIsScrapingInProgress(true);
      const result = await triggerScraping();
      
      toast({
        title: "Успіх",
        description: result.message,
      });
      
      refetch();
    } catch (error) {
      console.error('Error during scraping:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося отримати дані з сайту",
        variant: "destructive",
      });
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const handleAddCar = async (carData: Partial<ScrapedCar>) => {
    try {
      // Validate required fields
      if (!carData.external_id || !carData.title || !carData.price || !carData.external_url) {
        throw new Error('Missing required fields');
      }

      const { error } = await supabase
        .from('scraped_cars')
        .insert({
          external_id: carData.external_id,
          title: carData.title,
          price: carData.price,
          external_url: carData.external_url,
          source: carData.source || 'manual',
          year: carData.year,
          mileage: carData.mileage,
          fuel_type: carData.fuel_type,
          transmission: carData.transmission,
          location: carData.location,
          image_url: carData.image_url
        });

      if (error) throw error;

      toast({
        title: "Успіх",
        description: "Автомобіль успішно додано",
      });

      refetch();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding car:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося додати автомобіль",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Автомобілі з CarOutlet</h1>
            <div className="space-x-4">
              <Button
                variant="outline"
                onClick={handleScraping}
                disabled={isScrapingInProgress}
              >
                {isScrapingInProgress ? "Завантаження..." : "Оновити дані"}
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    Додати автомобіль
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Додати автомобіль</DialogTitle>
                  </DialogHeader>
                  <ScrapedCarForm onSubmit={handleAddCar} />
                </DialogContent>
              </Dialog>
            </div>
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
