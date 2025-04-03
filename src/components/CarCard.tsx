
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CarCardProps {
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

const CarCard = ({ 
  id,
  image, 
  name, 
  price, 
  year, 
  mileage,
  category,
  transmission,
  fuel_type,
  engine_size,
  engine_power 
}: CarCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
      <CardContent className="p-0">
        <img src={image} alt={name} className="w-full h-40 sm:h-48 object-cover" />
        <div className="p-3 sm:p-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{name}</h3>
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-bold text-navy">{price}</p>
            <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
              <span>Rok: {year}</span>
              <span>Przebieg: {mileage}</span>
              <span>Typ: {category}</span>
              <span>Skrzynia: {transmission}</span>
              <span>Paliwo: {fuel_type}</span>
              <span>Pojemnosc: {engine_size}</span>
              <span className="col-span-2">Moc: {engine_power}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button 
          className="w-full bg-navy hover:bg-navy/90 text-sm sm:text-base"
          onClick={() => navigate(`/car/${id}`)}
        >
          Wiecej informacji
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
