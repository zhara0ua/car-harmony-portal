
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
import { type ScrapedCar } from "@/types/scraped-car";

interface ScrapedCarFormProps {
  car?: ScrapedCar;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ScrapedCarForm = ({ car, onSubmit }: ScrapedCarFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Назва</Label>
        <Input id="title" name="title" defaultValue={car?.title} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Ціна (€)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            defaultValue={car?.price} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Рік</Label>
          <Input 
            id="year" 
            name="year" 
            type="number" 
            defaultValue={car?.year} 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mileage">Пробіг</Label>
        <Input id="mileage" name="mileage" defaultValue={car?.mileage} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuel_type">Тип палива</Label>
        <Select name="fuel_type" defaultValue={car?.fuel_type || "petrol"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип палива" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="petrol">Бензин</SelectItem>
            <SelectItem value="diesel">Дизель</SelectItem>
            <SelectItem value="hybrid">Гібрид</SelectItem>
            <SelectItem value="electric">Електро</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transmission">Коробка передач</Label>
        <Select name="transmission" defaultValue={car?.transmission || "automatic"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип КПП" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="automatic">Автомат</SelectItem>
            <SelectItem value="manual">Механіка</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Локація</Label>
        <Input id="location" name="location" defaultValue={car?.location} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL зображення</Label>
        <Input id="image_url" name="image_url" defaultValue={car?.image_url} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="external_url">Посилання на оголошення</Label>
        <Input id="external_url" name="external_url" defaultValue={car?.external_url} />
      </div>

      <Button type="submit">{car ? "Зберегти" : "Додати"}</Button>
    </form>
  );
};
