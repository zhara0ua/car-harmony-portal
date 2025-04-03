
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
import { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface CarFormProps {
  car?: Car;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, imageFile?: File | null) => Promise<void>;
}

export const CarForm = ({ car, onSubmit }: CarFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(car?.image || null);

  // Extract numeric price value from formatted price string
  const getNumericPrice = () => {
    if (!car?.price) return '';
    return car.price_number;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(e, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="image">Фото автомобіля</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input 
              id="image_upload" 
              name="image_upload" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Label 
              htmlFor="image_upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted transition-colors"
            >
              <Upload className="mb-2" />
              <span className="text-sm">Натисніть для вибору файлу</span>
            </Label>
            {!imagePreview && (
              <Input 
                id="image" 
                name="image" 
                placeholder="або вставте URL зображення" 
                defaultValue={car?.image}
                className="mt-2" 
              />
            )}
          </div>
          <div className="flex items-center justify-center h-32 bg-muted rounded-md overflow-hidden">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Попередній перегляд" 
                className="max-h-full max-w-full object-contain" 
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm">Попередній перегляд</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button type="submit">{car ? "Зберегти" : "Додати"}</Button>
    </form>
  );
};
