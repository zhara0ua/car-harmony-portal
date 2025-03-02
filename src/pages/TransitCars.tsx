
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TransitCarCard from "@/components/transit/TransitCarCard";
import TransitBenefits from "@/components/transit/TransitBenefits";
import ContactBanner from "@/components/transit/ContactBanner";
import TransitHeader from "@/components/transit/TransitHeader";
import TransitCarFilters from "@/components/transit/TransitCarFilters";
import { TransitCar, mockTransitCars } from "@/components/transit/types";
import { useTranslation } from "react-i18next";

const TransitCars = () => {
  const [allTransitCars, setAllTransitCars] = useState<TransitCar[]>([]);
  const [filteredCars, setFilteredCars] = useState<TransitCar[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // In a real app, this would be an API call
    setAllTransitCars(mockTransitCars);
    setFilteredCars(mockTransitCars);
  }, []);

  const handleFilterChange = (filteredCars: TransitCar[]) => {
    setFilteredCars(filteredCars);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <TransitHeader />
        
        <TransitCarFilters 
          cars={allTransitCars} 
          onFilterChange={handleFilterChange} 
        />

        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {filteredCars.map((car) => (
              <TransitCarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 mb-12">
            <h3 className="text-lg font-medium text-gray-600">
              За вказаними фільтрами автомобілів не знайдено
            </h3>
            <p className="text-gray-500">
              Спробуйте змінити параметри фільтрів
            </p>
          </div>
        )}

        <TransitBenefits />
        <ContactBanner />
      </main>

      <Footer />
    </div>
  );
};

export default TransitCars;
