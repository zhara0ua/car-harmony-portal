
import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadTab } from "./FileUploadTab";
import { UrlUploadTab } from "./UrlUploadTab";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  initialImages: string[];
  onImagesChange: (files: File[], previews: string[], mainImageIndex: number) => void;
}

export const ImageUploader = ({ initialImages = [], onImagesChange }: ImageUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialImages);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with initial images
    if (initialImages.length > 0) {
      console.log("ImageUploader: Initializing with images:", initialImages);
      setImagePreviews(initialImages);
      
      // Notify parent component
      onImagesChange(uploadedFiles, initialImages, mainImageIndex);
    }
  }, [initialImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      console.log("Files selected:", newFiles.map(f => f.name));
      
      // Validate file sizes
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const oversizedFiles = newFiles.filter(file => file.size > maxSizeBytes);
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(", ");
        toast({
          title: "Файл занадто великий",
          description: `Файли перевищують ${maxSizeMB}MB: ${fileNames}`,
          variant: "destructive",
        });
        
        // Filter out oversized files
        const validFiles = newFiles.filter(file => file.size <= maxSizeBytes);
        if (validFiles.length === 0) {
          return;
        }
      }
      
      const newPreviews: string[] = [];
      
      // Generate previews for each file
      newFiles.forEach(file => {
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      });
      
      // Update state with new files and previews
      const updatedFiles = [...uploadedFiles, ...newFiles];
      const updatedPreviews = [...imagePreviews, ...newPreviews];
      
      console.log("ImageUploader: Updated previews:", updatedPreviews.length);
      
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

  const handleUrlSubmit = (url: string) => {
    if (url && url.trim() !== "" && url.startsWith("http")) {
      console.log("URL image added:", url);
      
      // Add URL to previews
      const updatedPreviews = [...imagePreviews, url];
      setImagePreviews(updatedPreviews);
      
      // Notify parent component
      onImagesChange(uploadedFiles, updatedPreviews, mainImageIndex);
    }
  };

  const removeImage = (index: number) => {
    console.log("Removing image at index:", index);
    
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
    console.log("Setting image as main:", index);
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
          <FileUploadTab onFileChange={handleFileChange} />
        </TabsContent>
        
        <TabsContent value="url" className="py-2">
          <UrlUploadTab onUrlSubmit={handleUrlSubmit} />
        </TabsContent>
      </Tabs>
      
      <ImagePreviewGrid 
        imagePreviews={imagePreviews}
        mainImageIndex={mainImageIndex}
        onRemove={removeImage}
        onSetMain={setAsMain}
      />
    </div>
  );
};
