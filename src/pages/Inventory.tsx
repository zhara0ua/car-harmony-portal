
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarGrid from "@/components/inventory/CarGrid";
import CarFilters from "@/components/inventory/CarFilters";
import { useCars } from "@/hooks/useCars";
import { triggerScraping } from "@/utils/scraping";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function Inventory() {
  const [filters, setFilters] = useState({
    category: "all",
    transmission: "all",
    fuelType: "all",
    make: "all",
    model: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "created_at-desc"
  });
  const [visibleCars, setVisibleCars] = useState(9);
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // State for filters collapsible
  const { toast } = useToast();

  const { cars } = useCars(filters);

  // Calculate unique makes and models from available cars
  const uniqueMakes = Array.from(new Set(cars.map(car => car.make))).sort();
  const uniqueModels = Array.from(new Set(cars.map(car => car.model))).sort();

  const handleLoadMore = () => {
    setVisibleCars(prev => prev + 9);
  };

  const handleScraping = async () => {
    setIsScrapingInProgress(true);
    try {
      const result = await triggerScraping();
      
      const oldScraperCount = result.data.oldScraper?.cars?.length || 0;
      const openlaneCount = result.data.openlane?.cars?.length || 0;
      
      toast({
        title: "Скрапінг завершено",
        description: `Знайдено ${oldScraperCount + openlaneCount} автомобілів:
        - CarOutlet: ${oldScraperCount}
        - OpenLane: ${openlaneCount}`,
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Помилка скрапінгу",
        variant: "destructive",
      });
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Наявні автомобілі</h1>
          <Button
            variant="outline"
            onClick={handleScraping}
            disabled={isScrapingInProgress}
          >
            {isScrapingInProgress ? "Оновлення..." : "Оновити базу авто"}
          </Button>
        </div>

        <CarFilters 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          category={filters.category}
          setCategory={(value) => setFilters(prev => ({ ...prev, category: value }))}
          transmission={filters.transmission}
          setTransmission={(value) => setFilters(prev => ({ ...prev, transmission: value }))}
          fuelType={filters.fuelType}
          setFuelType={(value) => setFilters(prev => ({ ...prev, fuelType: value }))}
          make={filters.make}
          setMake={(value) => setFilters(prev => ({ ...prev, make: value }))}
          model={filters.model}
          setModel={(value) => setFilters(prev => ({ ...prev, model: value }))}
          minPrice={filters.minPrice}
          setMinPrice={(value) => setFilters(prev => ({ ...prev, minPrice: value }))}
          maxPrice={filters.maxPrice}
          setMaxPrice={(value) => setFilters(prev => ({ ...prev, maxPrice: value }))}
          sortBy={filters.sortBy}
          setSortBy={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
          uniqueMakes={uniqueMakes}
          uniqueModels={uniqueModels}
        />
        
        <div className="mt-8">
          <CarGrid
            cars={cars}
            visibleCars={visibleCars}
            hasMoreCars={visibleCars < cars.length}
            onLoadMore={handleLoadMore}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
