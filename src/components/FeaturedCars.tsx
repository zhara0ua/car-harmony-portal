
import { useEffect, useState } from "react";
import CarCard from "@/components/CarCard";
import { supabase } from "@/integrations/supabase/client";

interface Car {
  id: number;
  image: string;
  name: string;
  price: string;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
}

const FeaturedCars = () => {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      const { data } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        setCars(data);
      }
    };

    fetchCars();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-navy mb-8">Рекомендовані автомобілі</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
