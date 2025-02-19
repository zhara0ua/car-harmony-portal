
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ScrapedCars() {
  const [filters, setFilters] = useState<Filters>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: cars, isLoading, error, refetch } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      console.log('Fetching cars with filters:', filters);
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
      console.log('Fetched cars:', data);
      if (error) throw error;
      return data as ScrapedCar[];
    }
  });

  const handleAddCar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const newCar = {
        title: formData.get('title') as string,
        price: parseInt(formData.get('price') as string),
        year: parseInt(formData.get('year') as string),
        mileage: formData.get('mileage') as string,
        fuel_type: formData.get('fuel_type') as string,
        transmission: formData.get('transmission') as string,
        location: formData.get('location') as string,
        image_url: formData.get('image_url') as string,
        external_url: formData.get('external_url') as string,
        external_id: crypto.randomUUID(), // Generate a unique ID
        source: 'manual'
      };

      const { error } = await supabase
        .from('scraped_cars')
        .insert(newCar);

      if (error) throw error;

      toast({
        title: "Успіх",
        description: "Автомобіль успішно додано",
      });

      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error adding car:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося додати автомобіль",
        variant: "destructive",
      });
    }
  };

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
