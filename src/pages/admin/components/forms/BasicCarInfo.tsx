
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car } from "../../types/car";

interface BasicCarInfoProps {
  car?: Car;
}

export const BasicCarInfo = ({ car }: BasicCarInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="make">Марка</Label>
        <Input 
          id="make" 
          name="make"
          defaultValue={car?.make || ""} 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model">Модель</Label>
        <Input 
          id="model" 
          name="model"
          defaultValue={car?.model || ""} 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="year">Рік</Label>
        <Input 
          id="year" 
          name="year"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 1} 
          defaultValue={car?.year || new Date().getFullYear()} 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Ціна (PLN)</Label>
        <Input 
          id="price" 
          name="price"
          type="number"
          min="0"
          defaultValue={car?.price_number || ""} 
          required
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="mileage">Пробіг (км)</Label>
        <Input 
          id="mileage" 
          name="mileage"
          defaultValue={car?.mileage ? car.mileage.replace(" km.", "").replace(" km", "") : ""} 
          required
        />
      </div>
    </div>
  );
};
