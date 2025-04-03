
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
  const [imagePreviews, setImagePreviews] = useState<string[]>(car?.images || (car?.image ? [car.image] : []));
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const handleImagesChange = (files: File[], previews: string[], mainIndex: number) => {
    setImageFiles(files);
    setImagePreviews(previews);
    setMainImageIndex(mainIndex);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Add image URLs from previews that are not from uploaded files
    // These will be added to the form data
    imagePreviews.forEach((preview, index) => {
      // If this is not a blob URL (not from a file input) and starts with http
      if (!preview.startsWith('blob:') && preview.startsWith('http')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = `image_url_${index}`;
        input.value = preview;
        e.currentTarget.appendChild(input);
      }
    });
    
    // Add main image index
    const mainIndexInput = document.createElement('input');
    mainIndexInput.type = 'hidden';
    mainIndexInput.name = 'mainImageIndex';
    mainIndexInput.value = mainImageIndex.toString();
    e.currentTarget.appendChild(mainIndexInput);
    
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
