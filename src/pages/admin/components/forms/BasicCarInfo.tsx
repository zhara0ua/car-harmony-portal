
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car } from "../../types/car";

interface BasicCarInfoProps {
  car?: Car;
}

export const BasicCarInfo = ({ car }: BasicCarInfoProps) => {
  // Extract numeric price value from formatted price string
  const getNumericPrice = () => {
    if (!car?.price) return '';
    return car.price_number;
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Марка</Label>
          <Input id="make" name="make" defaultValue={car?.make} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Модель</Label>
          <Input id="model" name="model" defaultValue={car?.model} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Ціна (zł)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            defaultValue={getNumericPrice()} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Рік</Label>
          <Input id="year" name="year" type="number" defaultValue={car?.year} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mileage">Пробіг</Label>
        <Input id="mileage" name="mileage" defaultValue={car?.mileage} required />
      </div>
    </>
  );
};
