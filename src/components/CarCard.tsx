import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CarCardProps {
  image: string;
  name: string;
  price: string;
  year: number;
  mileage: string;
}

const CarCard = ({ image, name, price, year, mileage }: CarCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <img src={image} alt={name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-navy">{price}</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Rok: {year}</span>
              <span>Przebieg: {mileage}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-navy hover:bg-navy/90">Zobacz Szczegóły</Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;