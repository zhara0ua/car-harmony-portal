
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import CarForm from "@/components/admin/CarForm";
import { Card } from "@/components/ui/card";
import { Car } from "@/types/car";
import { carsData } from "@/data/cars";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import FiltersSection from "@/components/inventory/FiltersSection";
import CarsGrid from "@/components/inventory/CarsGrid";

const Inventory = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({});
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>("all");
  const [make, setMake] = useState<string>("all");
  const [model, setModel] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [visibleCars, setVisibleCars] = useState(9);

  const handleAddCar = () => {
    setIsAddingCar(true);
  };

  const handleAddCarSubmit = () => {
    toast({
      title: "Успіх!",
      description: "Автомобіль успішно додано.",
    });
    setIsAddingCar(false);
    setNewCar({});
  };

  const handleAddCarCancel = () => {
    setIsAddingCar(false);
    setNewCar({});
  };

  const uniqueMakes = Array.from(new Set(carsData.map(car => car.make)));
  const uniqueModels = Array.from(new Set(carsData.filter(car => make === "all" || car.make === make).map(car => car.model)));

  const filteredCars = carsData
    .filter(car => {
      if (category !== "all" && car.category !== category) return false;
      if (transmission !== "all" && car.transmission !== transmission) return false;
      if (fuelType !== "all" && car.fuelType !== fuelType) return false;
      if (make !== "all" && car.make !== make) return false;
      if (model !== "all" && car.model !== model) return false;
      if (minPrice && car.priceNumber < parseInt(minPrice)) return false;
      if (maxPrice && car.priceNumber > parseInt(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.priceNumber - b.priceNumber;
        case "price-desc":
          return b.priceNumber - a.priceNumber;
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        default:
          return 0;
      }
    });

  const hasMoreCars = visibleCars < filteredCars.length;

  const loadMore = () => {
    setVisibleCars(prev => prev + 9);
  };

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <InventoryHeader onAddCar={handleAddCar} />

        {isAddingCar && (
          <Card className="p-6 mb-8">
            <CarForm
              car={newCar}
              onSubmit={handleAddCarSubmit}
              onCancel={handleAddCarCancel}
              setCar={setNewCar}
            />
          </Card>
        )}
        
        <FiltersSection
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          make={make}
          setMake={setMake}
          model={model}
          setModel={setModel}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          category={category}
          setCategory={setCategory}
          transmission={transmission}
          setTransmission={setTransmission}
          fuelType={fuelType}
          setFuelType={setFuelType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          uniqueMakes={uniqueMakes}
          uniqueModels={uniqueModels}
        />
        
        <CarsGrid
          cars={filteredCars}
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
