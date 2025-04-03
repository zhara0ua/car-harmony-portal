
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Check } from "lucide-react";

interface ImageUploaderProps {
  initialImages: string[];
  onImagesChange: (files: File[], previews: string[], mainImageIndex: number) => void;
}

export const ImageUploader = ({ initialImages = [], onImagesChange }: ImageUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with initial images
    if (initialImages.length > 0) {
      setImagePreviews(initialImages);
      // Notify parent component
      onImagesChange(uploadedFiles, initialImages, mainImageIndex);
    }
  }, [initialImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviews: string[] = [];
      
      // Generate previews for each file
      newFiles.forEach(file => {
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      });
      
      // Update state with new files and previews
      const updatedFiles = [...uploadedFiles, ...newFiles];
      const updatedPreviews = [...imagePreviews, ...newPreviews];
      
      setUploadedFiles(updatedFiles);
      setImagePreviews(updatedPreviews);
      
      // Notify parent component
      onImagesChange(updatedFiles, updatedPreviews, mainImageIndex);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl && imageUrl.trim() !== "" && imageUrl.startsWith("http")) {
      // Add URL to previews
      const updatedPreviews = [...imagePreviews, imageUrl];
      setImagePreviews(updatedPreviews);
      
      // Notify parent component
      onImagesChange(uploadedFiles, updatedPreviews, mainImageIndex);
      
      // Clear URL input
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    
    // If removing a file, also remove it from uploadedFiles
    const isFilePreview = index < uploadedFiles.length;
    let updatedFiles = [...uploadedFiles];
    
    if (isFilePreview) {
      updatedFiles.splice(index, 1);
    }
    
    // Update main image index if necessary
    let newMainIndex = mainImageIndex;
    if (index === mainImageIndex) {
      // If removing the main image, set the first image as main
      newMainIndex = updatedPreviews.length > 0 ? 0 : -1;
    } else if (index < mainImageIndex) {
      // If removing an image before the main image, decrement the index
      newMainIndex--;
    }
    
    setUploadedFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    setMainImageIndex(newMainIndex < 0 ? 0 : newMainIndex);
    
    // Notify parent component
    onImagesChange(updatedFiles, updatedPreviews, newMainIndex < 0 ? 0 : newMainIndex);
  };

  const setAsMain = (index: number) => {
    setMainImageIndex(index);
    
    // Notify parent component
    onImagesChange(uploadedFiles, imagePreviews, index);
  };

  return (
    <div className="space-y-4">
      <Label>Зображення</Label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Завантажити файл</TabsTrigger>
          <TabsTrigger value="url">Додати за посиланням</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="py-2">
          <div className="flex flex-col space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              Оберіть один або кілька файлів зображень
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="py-2">
          <form onSubmit={handleUrlSubmit} className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <Button type="submit">Додати</Button>
          </form>
          <p className="text-sm text-gray-500 mt-1">
            Вставте URL-адресу зображення
          </p>
        </TabsContent>
      </Tabs>
      
      {imagePreviews.length > 0 && (
        <div className="mt-4">
          <Label>Попередній перегляд зображень</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {imagePreviews.map((preview, index) => (
              <div 
                key={index} 
                className={`relative rounded-md overflow-hidden border-2 ${
                  index === mainImageIndex ? "border-primary" : "border-gray-200"
                }`}
              >
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    // Handle image loading errors
                    console.error(`Error loading image at index ${index}:`, preview);
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                
                <div className="absolute top-1 right-1 flex space-x-1">
                  {index === mainImageIndex ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="default"
                      className="h-6 w-6"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 bg-white"
                      onClick={() => setAsMain(index)}
                    >
                      <ImageIcon className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {index === mainImageIndex && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-1 text-center">
                    Головне фото
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
