
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionFilters, AuctionCar } from "@/types/auction-car";
import { SortField, SortOrder } from "@/hooks/useAuctionCars";

export const useAuctionFiltering = () => {
  const [filters, setFilters] = useState<AuctionFilters>({});
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('end_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const carsPerPage = 20;
  
  const { data: cars, isLoading } = useQuery({
    queryKey: ['auction-cars', filters, sortField, sortOrder],
    queryFn: async () => {
      console.log('Fetching auction cars with filters and sort:', filters, sortField, sortOrder);
      
      // Build the base query
      let query = supabase
        .from('auction_cars')
        .select('*', { count: 'exact' })
        .order(sortField, { ascending: sortOrder === 'asc' });
      
      // Apply filters
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
      if (filters.transmission && filters.transmission !== "all_transmissions") {
        query = query.eq('transmission', filters.transmission);
      }
      
      // Fetch all matching cars using pagination to bypass 1000 row limit
      const fetchAllFilteredCars = async () => {
        const PAGE_SIZE = 1000; // Supabase's max rows per request
        let allCars: AuctionCar[] = [];
        let page = 0;
        let hasMore = true;
        
        while (hasMore) {
          const from = page * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;
          
          console.log(`Fetching page ${page + 1}, rows ${from} to ${to}`);
          
          const { data, error, count } = await query.range(from, to);
          
          if (error) {
            setErrorMessage(error.message);
            setIsErrorDialogOpen(true);
            throw error;
          }
          
          if (data.length === 0) {
            hasMore = false;
          } else {
            allCars = [...allCars, ...data];
            page++;
            
            // Check if we should continue fetching
            hasMore = count !== null && allCars.length < count;
            console.log(`Fetched ${allCars.length} of ${count} total cars`);
          }
        }
        
        return allCars;
      };
      
      // Handle mileage filtering separately since it requires JS filtering
      if (filters.minMileage || filters.maxMileage) {
        // Get all results first then filter in JS since mileage is a string
        const allCars = await fetchAllFilteredCars();
        
        // Now filter by mileage
        return allCars.filter((car: AuctionCar) => {
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

      // If no mileage filters, just get all cars
      return fetchAllFilteredCars();
    }
  });

  // Calculate pagination
  const totalCars = cars?.length || 0;
  const totalPages = Math.ceil(totalCars / carsPerPage);
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars?.slice(indexOfFirstCar, indexOfLastCar);

  const handleFilterChange = (newFilters: AuctionFilters) => {
    console.log('Applying new filters:', newFilters);
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort order if same field is selected
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default order based on the field type
      setSortField(field);
      
      // Set appropriate default order for each field type
      if (field === 'title') {
        setSortOrder('asc'); // A-Z is more natural for names
      } else if (field === 'year') {
        setSortOrder('desc'); // Newest first is more natural for years
      } else if (field === 'start_price') {
        setSortOrder('asc'); // Lowest first is more natural for prices
      } else if (field === 'end_date') {
        setSortOrder('asc'); // Earliest first is more natural for end dates
      }
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    filters,
    currentCars,
    currentPage,
    totalCars,
    totalPages,
    isLoading,
    sortField,
    sortOrder,
    isErrorDialogOpen,
    errorMessage,
    setIsErrorDialogOpen,
    handleFilterChange,
    handleSort,
    handlePageChange
  };
};
