
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCarCard } from "@/components/auctions/AuctionCarCard";
import { AuctionFilters } from "@/components/auctions/AuctionFilters";
import { type AuctionFilters as AuctionFiltersType, type AuctionCar } from "@/types/auction-car";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function Auctions() {
  const [filters, setFilters] = useState<AuctionFiltersType>({});
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { data: cars, isLoading } = useQuery({
    queryKey: ['auction-cars', filters],
    queryFn: async () => {
      console.log('Fetching auction cars with filters:', filters);
      let query = supabase
        .from('auction_cars')
        .select('*')
        .order('end_date', { ascending: true });
      
      if (filters.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      if (filters.minPrice) {
        query = query.gte('start_price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('start_price', filters.maxPrice);
      }
      if (filters.make && filters.make !== "all_makes") {
        query = query.eq('make', filters.make);
      }
      if (filters.model && filters.model !== "all_models") {
        query = query.eq('model', filters.model);
      }

      const { data, error } = await query;
      
      console.log('Query result:', { data, error });
      
      if (error) {
        setErrorMessage(error.message);
        setIsErrorDialogOpen(true);
        throw error;
      }
      return data as AuctionCar[];
    }
  });

  const handleFilterChange = (newFilters: AuctionFiltersType) => {
    console.log('Applying new filters:', newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Aukcje samochodów</h1>
          </div>

          <AuctionFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Ładowanie...</p>
            </div>
          ) : !cars?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak dostępnych aukcji
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <AuctionCarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Błąd</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorDialogOpen(false)}>
              Rozumiem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
