
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  initialImages: string[];
  onImagesChange: (files: File[], previewUrls: string[], mainIndex: number) => void;
}

export const ImageUploader = ({ initialImages, onImagesChange }: ImageUploaderProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onImagesChange(newFiles, newPreviews, mainImageIndex);

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
    onImagesChange(newFiles, newPreviews, index === mainImageIndex ? 0 : mainImageIndex > index ? mainImageIndex - 1 : mainImageIndex);

    // Adjust main image index if needed
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
    onImagesChange(imageFiles, imagePreviews, index);
  };

  return (
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
  );
};
