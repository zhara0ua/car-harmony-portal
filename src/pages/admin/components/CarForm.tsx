
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car } from "../types/car";

interface CarFormProps {
  car?: Car;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const CarForm = ({ car, onSubmit }: CarFormProps) => {
  // Extract numeric price value from formatted price string
  const getNumericPrice = () => {
    if (!car?.price) return '';
    return car.price_number;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="category">Тип кузова</Label>
        <Select name="category" defaultValue={car?.category || "Седан"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип кузова" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Седан">Седан</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Купе">Купе</SelectItem>
            <SelectItem value="Універсал">Універсал</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transmission">Коробка передач</Label>
        <Select name="transmission" defaultValue={car?.transmission || "Автомат"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип КПП" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Автомат">Автомат</SelectItem>
            <SelectItem value="Механіка">Механіка</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuel_type">Тип палива</Label>
        <Select name="fuel_type" defaultValue={car?.fuel_type || "Бензин"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип палива" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Бензин">Бензин</SelectItem>
            <SelectItem value="Дизель">Дизель</SelectItem>
            <SelectItem value="Гібрид">Гібрид</SelectItem>
            <SelectItem value="Електро">Електро</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="engine_size">Об'єм двигуна</Label>
          <Input id="engine_size" name="engine_size" defaultValue={car?.engine_size} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="engine_power">Потужність</Label>
          <Input id="engine_power" name="engine_power" defaultValue={car?.engine_power} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">URL зображення</Label>
        <Input id="image" name="image" defaultValue={car?.image} required />
      </div>

      <Button type="submit">{car ? "Зберегти" : "Додати"}</Button>
    </form>
  );
};
