
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";

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

interface CarGridProps {
  cars: Car[];
  visibleCars: number;
  hasMoreCars: boolean;
  onLoadMore: () => void;
}

const CarGrid = ({ cars, visibleCars, hasMoreCars, onLoadMore }: CarGridProps) => {
  const visibleFilteredCars = cars.slice(0, visibleCars);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleFilteredCars.map((car) => (
          <CarCard key={car.id} {...car} />
        ))}
      </div>

      {hasMoreCars && (
        <div className="mt-12 text-center">
          <Button 
            onClick={onLoadMore}
            className="px-8 rounded-full"
          >
            Завантажити ще
          </Button>
        </div>
      )}
    </>
  );
};

export default CarGrid;
