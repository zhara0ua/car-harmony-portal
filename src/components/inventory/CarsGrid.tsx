
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Car } from "@/types/car";

interface CarsGridProps {
  cars: Car[];
  visibleCars: number;
  hasMoreCars: boolean;
  onLoadMore: () => void;
}

const CarsGrid = ({ cars, visibleCars, hasMoreCars, onLoadMore }: CarsGridProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.slice(0, visibleCars).map((car, index) => (
          <CarCard key={index} {...car} />
        ))}
      </div>

      {hasMoreCars && (
        <div className="mt-12 text-center">
          <Button 
            onClick={onLoadMore}
            className="bg-navy hover:bg-navy/90 text-white px-8 py-2 rounded-full transition-colors"
          >
            Завантажити ще
          </Button>
        </div>
      )}
    </>
  );
};

export default CarsGrid;
