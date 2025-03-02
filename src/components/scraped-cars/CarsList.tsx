
import { ScrapedCarCard } from "@/components/scraped-cars/ScrapedCarCard";
import { type ScrapedCar } from "@/types/scraped-car";

interface CarsListProps {
  cars: ScrapedCar[] | undefined;
  isLoading: boolean;
}

export const CarsList = ({ cars, isLoading }: CarsListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Завантаження...</p>
      </div>
    );
  }

  if (!cars?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Немає доступних автомобілів
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <ScrapedCarCard key={car.id} car={car} />
      ))}
    </div>
  );
};
