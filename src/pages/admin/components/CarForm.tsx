
import { Button } from "@/components/ui/button";
import { Car } from "../types/car";
import { useState, useEffect } from "react";
import { BasicCarInfo } from "./forms/BasicCarInfo";
import { CarSpecifications } from "./forms/CarSpecifications";
import { ImageUploader } from "./forms/ImageUploader";
import { toast } from "@/hooks/use-toast";

interface CarFormProps {
  car?: Car;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => Promise<void>;
}

export const CarForm = ({ car, onSubmit }: CarFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(car?.images || (car?.image ? [car.image] : []));
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Update imagePreviews if car prop changes
    if (car) {
      const images = car.images && car.images.length > 0 
        ? car.images 
        : car.image ? [car.image] : [];
      
      setImagePreviews(images);
    }
  }, [car]);

  const handleImagesChange = (files: File[], previews: string[], mainIndex: number) => {
    console.log("Images changed:", { files, previews, mainIndex });
    setImageFiles(files);
    setImagePreviews(previews);
    setMainImageIndex(mainIndex);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("Form submitted with:", {
        imageFiles: imageFiles.map(f => f.name),
        previews: imagePreviews,
        mainImageIndex
      });
      
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
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося відправити форму",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BasicCarInfo car={car} />
      <CarSpecifications car={car} />
      <ImageUploader 
        initialImages={imagePreviews}
        onImagesChange={handleImagesChange}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Обробка..." : car ? "Зберегти" : "Додати"}
      </Button>
    </form>
  );
};
