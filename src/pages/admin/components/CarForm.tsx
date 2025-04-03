
import { Button } from "@/components/ui/button";
import { Car } from "../types/car";
import { useState } from "react";
import { BasicCarInfo } from "./forms/BasicCarInfo";
import { CarSpecifications } from "./forms/CarSpecifications";
import { ImageUploader } from "./forms/ImageUploader";

interface CarFormProps {
  car?: Car;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => Promise<void>;
}

export const CarForm = ({ car, onSubmit }: CarFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const handleImagesChange = (files: File[], _previews: string[], mainIndex: number) => {
    setImageFiles(files);
    setMainImageIndex(mainIndex);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(e, imageFiles, mainImageIndex);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BasicCarInfo car={car} />
      <CarSpecifications car={car} />
      <ImageUploader 
        initialImages={car?.images || (car?.image ? [car.image] : [])}
        onImagesChange={handleImagesChange}
      />
      <Button type="submit">{car ? "Зберегти" : "Додати"}</Button>
    </form>
  );
};
