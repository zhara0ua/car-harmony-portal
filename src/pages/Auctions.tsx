
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCarCard } from "@/components/auctions/AuctionCarCard";
import { AuctionFilters } from "@/components/auctions/AuctionFilters";
import { type AuctionFilters as AuctionFiltersType, type AuctionCar } from "@/types/auction-car";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function Auctions() {
  const [filters, setFilters] = useState<AuctionFiltersType>({});
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 20;
  
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
      if (filters.fuelType && filters.fuelType !== "all_fuel_types") {
        query = query.eq('fuel_type', filters.fuelType);
      }
      
      // Handle mileage filtering
      // Since mileage is stored as a string, we need to handle parsing
      if (filters.minMileage || filters.maxMileage) {
        // Get all results first then filter in JS since mileage is a string
        const { data, error } = await query;
        
        if (error) {
          setErrorMessage(error.message);
          setIsErrorDialogOpen(true);
          throw error;
        }
        
        // Now filter by mileage
        return data.filter((car: AuctionCar) => {
          // Parse mileage to number, removing non-numeric characters
          const mileageStr = car.mileage?.toString() || '0';
          const mileageNum = parseInt(mileageStr.replace(/\D/g, ''));
          
          // Apply filters
          if (filters.minMileage && mileageNum < filters.minMileage) {
            return false;
          }
          if (filters.maxMileage && mileageNum > filters.maxMileage) {
            return false;
          }
          return true;
        }) as AuctionCar[];
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate pagination
  const totalCars = cars?.length || 0;
  const totalPages = Math.ceil(totalCars / carsPerPage);
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars?.slice(indexOfFirstCar, indexOfLastCar);

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCars.map((car) => (
                  <AuctionCarCard key={car.id} car={car} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                        </PaginationItem>
                      )}
                      
                      {pageNumbers.map(number => {
                        // Show current page, first, last, and 1 page before and after current page
                        if (
                          number === 1 || 
                          number === totalPages || 
                          (number >= currentPage - 1 && number <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={number}>
                              <PaginationLink 
                                isActive={number === currentPage}
                                onClick={() => handlePageChange(number)}
                              >
                                {number}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          (number === 2 && currentPage > 3) || 
                          (number === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={number}>
                              <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Pokazano {currentCars.length} z {totalCars} aukcji
              </div>
            </>
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
