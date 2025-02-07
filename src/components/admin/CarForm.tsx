
import { Car } from "@/types/car";
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

interface CarFormProps {
  car: Partial<Car>;
  onSubmit: () => void;
  onCancel: () => void;
  setCar: (car: Partial<Car>) => void;
  isEditing?: boolean;
}

const CarForm = ({ car, onSubmit, onCancel, setCar, isEditing }: CarFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Назва</Label>
        <Input
          value={car.name || ""}
          onChange={(e) => setCar({ ...car, name: e.target.value })}
          placeholder="Mercedes-Benz S-Class"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Марка</Label>
        <Input
          value={car.make || ""}
          onChange={(e) => setCar({ ...car, make: e.target.value })}
          placeholder="Mercedes-Benz"
        />
      </div>

      <div className="space-y-2">
        <Label>Модель</Label>
        <Input
          value={car.model || ""}
          onChange={(e) => setCar({ ...car, model: e.target.value })}
          placeholder="S-Class"
        />
      </div>

      <div className="space-y-2">
        <Label>Зображення (URL)</Label>
        <Input
          value={car.image || ""}
          onChange={(e) => setCar({ ...car, image: e.target.value })}
          placeholder="https://example.com/car-image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label>Ціна</Label>
        <Input
          value={car.price || ""}
          onChange={(e) => setCar({ ...car, price: e.target.value })}
          placeholder="85.000 zł"
        />
      </div>

      <div className="space-y-2">
        <Label>Рік</Label>
        <Input
          type="number"
          value={car.year || ""}
          onChange={(e) => setCar({ ...car, year: parseInt(e.target.value) })}
          placeholder="2023"
        />
      </div>

      <div className="space-y-2">
        <Label>Пробіг</Label>
        <Input
          value={car.mileage || ""}
          onChange={(e) => setCar({ ...car, mileage: e.target.value })}
          placeholder="24.000 km"
        />
      </div>

      <div className="space-y-2">
        <Label>Тип кузова</Label>
        <Select
          value={car.category}
          onValueChange={(value: "Седан" | "SUV" | "Купе" | "Універсал") => 
            setCar({ ...car, category: value })
          }
        >
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
        <Label>Коробка передач</Label>
        <Select
          value={car.transmission}
          onValueChange={(value: "Автомат" | "Механіка") => 
            setCar({ ...car, transmission: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Виберіть коробку передач" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Автомат">Автомат</SelectItem>
            <SelectItem value="Механіка">Механіка</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Тип палива</Label>
        <Select
          value={car.fuelType}
          onValueChange={(value: "Бензин" | "Дизель" | "Гібрид" | "Електро") => 
            setCar({ ...car, fuelType: value })
          }
        >
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

      <div className="space-y-2">
        <Label>Об'єм двигуна</Label>
        <Input
          value={car.engineSize || ""}
          onChange={(e) => setCar({ ...car, engineSize: e.target.value })}
          placeholder="3.0л"
        />
      </div>

      <div className="space-y-2">
        <Label>Потужність</Label>
        <Input
          value={car.enginePower || ""}
          onChange={(e) => setCar({ ...car, enginePower: e.target.value })}
          placeholder="435 к.с."
        />
      </div>

      <div className="flex gap-4 col-span-full">
        <Button
          onClick={onSubmit}
          className="bg-navy hover:bg-navy/90 text-white"
        >
          {isEditing ? "Оновити" : "Зберегти"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Скасувати
        </Button>
      </div>
    </div>
  );
};

export default CarForm;

