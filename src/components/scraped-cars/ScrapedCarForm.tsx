
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
import { FormEvent } from "react";

interface ScrapedCarFormProps {
  car?: ScrapedCar;
  onSubmit: (car: Partial<ScrapedCar>) => Promise<void>;
}

export const ScrapedCarForm = ({ car, onSubmit }: ScrapedCarFormProps) => {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Generate random ID if not provided
    const external_id = car?.external_id || crypto.randomUUID();
    
    const newCar = {
      external_id, // Required
      title: formData.get('title') as string, // Required
      price: formData.get('price') as string, // Required - keep as string to match ScrapedCar type
      year: Number(formData.get('year')) || undefined,
      mileage: formData.get('mileage') as string || undefined,
      fuel_type: formData.get('fuel_type') as string || undefined,
      transmission: formData.get('transmission') as string || undefined,
      location: formData.get('location') as string || undefined,
      image_url: formData.get('image_url') as string || undefined,
      external_url: formData.get('external_url') as string || `https://manual-entry/${external_id}`, // Required
      source: 'manual' // Required with default value
    };

    await onSubmit(newCar);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Назва авто</Label>
        <Input id="title" name="title" defaultValue={car?.title} required placeholder="Наприклад: BMW 520d 2019" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Ціна (€)</Label>
          <Input 
            id="price" 
            name="price" 
            type="text" 
            defaultValue={car?.price} 
            required 
            placeholder="25000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Рік</Label>
          <Input 
            id="year" 
            name="year" 
            type="number" 
            defaultValue={car?.year} 
            placeholder="2019"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mileage">Пробіг (км)</Label>
        <Input 
          id="mileage" 
          name="mileage" 
          defaultValue={car?.mileage} 
          placeholder="100000"
        />
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
        <Input 
          id="location" 
          name="location" 
          defaultValue={car?.location} 
          placeholder="Київ"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Посилання на фото</Label>
        <Input 
          id="image_url" 
          name="image_url" 
          defaultValue={car?.image_url} 
          placeholder="https://example.com/car-image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="external_url">Посилання на оголошення</Label>
        <Input 
          id="external_url" 
          name="external_url" 
          defaultValue={car?.external_url} 
          placeholder="https://example.com/car-listing"
        />
      </div>

      <Button type="submit" className="w-full">
        {car ? "Зберегти" : "Додати автомобіль"}
      </Button>
    </form>
  );
};
