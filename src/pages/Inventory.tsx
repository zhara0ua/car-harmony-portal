
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarFilters from "@/components/inventory/CarFilters";
import CarGrid from "@/components/inventory/CarGrid";
import { useCars } from "@/hooks/useCars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw } from "lucide-react";
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

  const { cars, isLoading, error, refetch } = useCars({
    category,
    transmission,
    fuelType,
    make,
    model,
    minPrice,
    maxPrice,
    sortBy,
  });

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make)));
  const uniqueModels = Array.from(new Set(
    cars.filter(car => make === "all" || car.make === make)
      .map(car => car.model)
  ));

  const hasMoreCars = visibleCars < cars.length;

  const loadMore = () => {
    setVisibleCars(prev => prev + 9);
  };

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-navy mb-8">Наші Автомобілі</h1>
        
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
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Помилка з'єднання з базою даних</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>Не вдалося завантажити автомобілі. Деталі помилки: {error}</p>
              <p>Перевірте, що змінні середовища VITE_SUPABASE_URL та VITE_SUPABASE_ANON_KEY встановлені правильно.</p>
              <Button 
                onClick={refetch} 
                variant="outline"
                className="w-fit flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Спробувати знову
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-navy" />
            <span className="ml-4 text-lg">Завантаження автомобілів...</span>
          </div>
        ) : (
          cars.length > 0 ? (
            <CarGrid
              cars={cars}
              visibleCars={visibleCars}
              hasMoreCars={hasMoreCars}
              onLoadMore={loadMore}
            />
          ) : !error && (
            <div className="text-center py-20">
              <p className="text-xl">Немає автомобілів, що відповідають вашим критеріям пошуку.</p>
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Inventory;
