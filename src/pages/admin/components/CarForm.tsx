
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
import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Plus } from "lucide-react";

interface CarFormProps {
  car?: Car;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => Promise<void>;
}

export const CarForm = ({ car, onSubmit }: CarFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(car?.images || (car?.image ? [car.image] : []));
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract numeric price value from formatted price string
  const getNumericPrice = () => {
    if (!car?.price) return '';
    return car.price_number;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [...imageFiles];
    const newPreviews: string[] = [...imagePreviews];

    Array.from(files).forEach(file => {
      newFiles.push(file);
      const objectUrl = URL.createObjectURL(file);
      newPreviews.push(objectUrl);
    });

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);

    // Reset the file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    // Remove the file and preview at the specified index
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);

    // Adjust main image index if needed
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(e, imageFiles, mainImageIndex);
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
        <Label htmlFor="images">Фото автомобіля</Label>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Input 
              id="image_upload" 
              name="image_upload" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              multiple
            />
            <Label 
              htmlFor="image_upload" 
              className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span>Вибрати файли</span>
            </Label>
            <span className="text-sm text-muted-foreground">
              Виберіть до 40 зображень (Головне зображення буде відмічено зеленою рамкою)
            </span>
          </div>

          {imagePreviews.length === 0 && (
            <div className="flex items-center justify-center h-32 bg-muted rounded-md overflow-hidden">
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm">Немає зображень</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div 
                key={index} 
                className={`relative group h-40 bg-muted rounded-md overflow-hidden ${index === mainImageIndex ? 'ring-2 ring-green-500' : ''}`}
              >
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setAsMainImage(index)}
                    title="Встановити як головне"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    title="Видалити"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {index === mainImageIndex && (
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                    Головне
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit">{car ? "Зберегти" : "Додати"}</Button>
    </form>
  );
};
