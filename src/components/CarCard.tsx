
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CarCardProps {
  image: string;
  name: string;
  price: string;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuelType: string;
  engineSize: string;
  enginePower: string;
}

const CarCard = ({ 
  image, 
  name, 
  price, 
  year, 
  mileage,
  category,
  transmission,
  fuelType,
  engineSize,
  enginePower 
}: CarCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <img src={image} alt={name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-navy">{price}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <span>Рік: {year}</span>
              <span>Пробіг: {mileage}</span>
              <span>Тип: {category}</span>
              <span>КПП: {transmission}</span>
              <span>Паливо: {fuelType}</span>
              <span>Об'єм: {engineSize}</span>
              <span>Потужність: {enginePower}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-navy hover:bg-navy/90">Дізнатись більше</Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
