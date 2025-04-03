
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AuctionCar } from "@/types/auction-car";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDistanceToNow, isAfter } from "date-fns";
import { pl } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuctionCarCardProps {
  car: AuctionCar;
}

export const AuctionCarCard = ({ car }: AuctionCarCardProps) => {
  const endDate = new Date(car.end_date);
  const isAuctionEnded = isAfter(new Date(), endDate);
  const isMobile = useIsMobile();
  
  const timeLeft = formatDistanceToNow(endDate, { 
    addSuffix: true, 
    locale: pl 
  });

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={car.image_url || '/placeholder.svg'} 
            alt={car.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={isAuctionEnded ? "destructive" : "secondary"}>
              {isAuctionEnded ? "Zakończona" : "Aktywna"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-grow">
        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{car.title}</h3>
        <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
          <p>Rok: {car.year}</p>
          {car.mileage && <p>Przebieg: {car.mileageFormatted || car.mileage}</p>}
          {car.fuel_type && <p>Paliwo: {car.fuel_type}</p>}
          {car.transmission && <p>Skrzynia biegów: {car.transmission}</p>}
          {car.location && <p>Lokalizacja: {car.location}</p>}
          {car.power && <p>Moc: {car.power}</p>}
          
          <div className="flex items-center gap-1 text-xs sm:text-sm mt-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{isAuctionEnded ? "Aukcja zakończona" : `Kończy się ${timeLeft}`}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between items-center">
        <div className="font-semibold text-lg sm:text-xl">
          {car.priceFormatted || formatPrice(car.start_price)}
        </div>
        <a 
          href={car.external_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-blue-600 hover:underline"
        >
          Szczegóły aukcji
        </a>
      </CardFooter>
    </Card>
  );
}
