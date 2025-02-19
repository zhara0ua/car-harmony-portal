
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ScrapedCar {
  id: number;
  external_id: string;
  title: string;
  price: number;
  year: number;
  mileage: string;
  fuel_type: string;
  transmission: string;
  location: string;
  image_url: string;
  external_url: string;
  source: string;
}

interface Filters {
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
}

export default function ScrapedCars() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({});
  
  const { data: cars, isLoading, refetch } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      let query = supabase
        .from('scraped_cars')
        .select('*');
      
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

  const startScraping = async () => {
    try {
      const response = await fetch(
        'https://btkfrowwhgcnzgncjjny.supabase.co/functions/v1/scrape-cars',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Успіх",
          description: data.message,
        });
        refetch();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося запустити скрапінг",
        variant: "destructive",
      });
    }
  };

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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Мін. рік"
                onChange={(e) => setFilters(f => ({ ...f, minYear: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Макс. рік"
                onChange={(e) => setFilters(f => ({ ...f, maxYear: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Мін. ціна"
                onChange={(e) => setFilters(f => ({ ...f, minPrice: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Макс. ціна"
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Select onValueChange={(value) => setFilters(f => ({ ...f, fuelType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Тип палива" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі</SelectItem>
                  <SelectItem value="petrol">Бензин</SelectItem>
                  <SelectItem value="diesel">Дизель</SelectItem>
                  <SelectItem value="hybrid">Гібрид</SelectItem>
                  <SelectItem value="electric">Електро</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(value) => setFilters(f => ({ ...f, transmission: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="КПП" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всі</SelectItem>
                  <SelectItem value="automatic">Автомат</SelectItem>
                  <SelectItem value="manual">Механіка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center">Завантаження...</div>
          ) : !cars?.length ? (
            <div className="text-center text-muted-foreground">
              Немає доступних автомобілів
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {car.image_url && (
                    <img 
                      src={car.image_url} 
                      alt={car.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{car.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Рік: {car.year}</div>
                      <div>Ціна: {car.price.toLocaleString()} €</div>
                      <div>Пробіг: {car.mileage}</div>
                      <div>КПП: {car.transmission}</div>
                      <div>Паливо: {car.fuel_type}</div>
                      <div>Локація: {car.location}</div>
                    </div>
                    <a 
                      href={car.external_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mt-4 text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Переглянути на сайті
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
