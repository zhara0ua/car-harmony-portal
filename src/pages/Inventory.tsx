
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarFilters from "@/components/inventory/CarFilters";
import CarGrid from "@/components/inventory/CarGrid";
import { useCars } from "@/hooks/useCars";
import { useTranslation } from "react-i18next";
import { useFilterData } from "@/components/auctions/filters/useFilterData";

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
  const { t } = useTranslation();
  const { fuelTypes, transmissions, isLoading: isFilterDataLoading } = useFilterData();

  const { cars } = useCars({
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
        <h1 className="text-4xl font-bold text-navy mb-8">{t("cars.title")}</h1>
        
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
          availableFuelTypes={fuelTypes}
          availableTransmissions={transmissions}
          isFilterDataLoading={isFilterDataLoading}
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
