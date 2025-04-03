
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "../../types/car";

interface CarSpecificationsProps {
  car?: Car;
}

export const CarSpecifications = ({ car }: CarSpecificationsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="category">Категорія</Label>
        <Select defaultValue={car?.category || "Седан"} name="category">
          <SelectTrigger id="category">
            <SelectValue placeholder="Оберіть категорію" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Седан">Седан</SelectItem>
            <SelectItem value="Купе">Купе</SelectItem>
            <SelectItem value="Хетчбек">Хетчбек</SelectItem>
            <SelectItem value="Універсал">Універсал</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Кросовер">Кросовер</SelectItem>
            <SelectItem value="Кабріолет">Кабріолет</SelectItem>
            <SelectItem value="Пікап">Пікап</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transmission">Коробка передач</Label>
        <Select defaultValue={car?.transmission || "Автомат"} name="transmission">
          <SelectTrigger id="transmission">
            <SelectValue placeholder="Оберіть тип коробки передач" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Автомат">Автомат</SelectItem>
            <SelectItem value="Механіка">Механіка</SelectItem>
            <SelectItem value="Робот">Робот</SelectItem>
            <SelectItem value="Варіатор">Варіатор</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fuel_type">Тип пального</Label>
        <Select defaultValue={car?.fuel_type || "Бензин"} name="fuel_type">
          <SelectTrigger id="fuel_type">
            <SelectValue placeholder="Оберіть тип пального" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Бензин">Бензин</SelectItem>
            <SelectItem value="Дизель">Дизель</SelectItem>
            <SelectItem value="Гібрид">Гібрид</SelectItem>
            <SelectItem value="Електро">Електро</SelectItem>
            <SelectItem value="Газ/Бензин">Газ/Бензин</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="engine_size">Об'єм двигуна</Label>
        <Input 
          id="engine_size" 
          name="engine_size"
          defaultValue={car?.engine_size || ""} 
          placeholder="Напр. 2.0л"
          required
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="engine_power">Потужність</Label>
        <Input 
          id="engine_power" 
          name="engine_power"
          defaultValue={car?.engine_power || ""} 
          placeholder="Напр. 150 к.с."
          required
        />
      </div>
    </div>
  );
};
