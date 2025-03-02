
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TransitCarCard from "@/components/transit/TransitCarCard";
import TransitBenefits from "@/components/transit/TransitBenefits";
import ContactBanner from "@/components/transit/ContactBanner";
import TransitHeader from "@/components/transit/TransitHeader";
import { TransitCar, mockTransitCars } from "@/components/transit/types";
import { useTranslation } from "react-i18next";

const TransitCars = () => {
  const [transitCars, setTransitCars] = useState<TransitCar[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // In a real app, this would be an API call
    setTransitCars(mockTransitCars);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <TransitHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {transitCars.map((car) => (
            <TransitCarCard key={car.id} car={car} />
          ))}
        </div>

        <TransitBenefits />
        <ContactBanner />
      </main>

      <Footer />
    </div>
  );
};

export default TransitCars;
