
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
  const { toast } = useToast();

  const { cars } = useCars(filters);

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
          filters={filters} 
          onFilterChange={setFilters}
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
