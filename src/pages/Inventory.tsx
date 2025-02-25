
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarFilters from "@/components/inventory/CarFilters";
import CarGrid from "@/components/inventory/CarGrid";
import { useCars } from "@/hooks/useCars";
import { triggerScraping } from "@/utils/scraping";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Inventory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>("all");
  const [make, setMake] = useState<string>("all");
  const [model, setModel] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [visibleCars, setVisibleCars] = useState(9);
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const { toast } = useToast();

  const { cars = [] } = useCars({
    category,
    transmission,
    fuelType,
    make,
    model,
    minPrice,
    maxPrice,
    sortBy,
  });

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make))).sort();
  const uniqueModels = Array.from(new Set(
    cars.filter(car => make === "all" || car.make === make)
      .map(car => car.model)
  )).sort();

  const hasMoreCars = visibleCars < cars.length;

  const loadMore = () => {
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
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-navy">Наші Автомобілі</h1>
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
          category={category}
          setCategory={setCategory}
          transmission={transmission}
          setTransmission={setTransmission}
          fuelType={fuelType}
          setFuelType={setFuelType}
          make={make}
          setMake={setMake}
          model={model}
          setModel={setModel}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
          uniqueMakes={uniqueMakes}
          uniqueModels={uniqueModels}
        />
        
        <CarGrid
          cars={cars}
          visibleCars={visibleCars}
          hasMoreCars={hasMoreCars}
          onLoadMore={loadMore}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Inventory;
