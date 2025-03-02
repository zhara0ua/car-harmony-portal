
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrapedCar } from "@/types/scraped-car";
import { formatPrice } from "@/lib/utils";

interface ScrapedCarCardProps {
  car: ScrapedCar;
}

export const ScrapedCarCard = ({ car }: ScrapedCarCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={car.image_url || '/placeholder.svg'} 
            alt={car.title}
            className="object-cover w-full h-full"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{car.title}</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Рік: {car.year}</p>
          {car.mileage && <p>Пробіг: {car.mileage}</p>}
          {car.fuel_type && <p>Паливо: {car.fuel_type}</p>}
          {car.transmission && <p>КПП: {car.transmission}</p>}
          {car.location && <p>Локація: {car.location}</p>}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="font-semibold text-xl">
          {formatPrice(car.price)}
        </div>
        <a 
          href={car.external_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Деталі
        </a>
      </CardFooter>
    </Card>
  );
};
