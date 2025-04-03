
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadTabProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadTab = ({ onFileChange }: FileUploadTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    
    try {
      onFileChange(e);
    } finally {
      // Reset loading state after a short delay to show feedback
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="hidden">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </div>
      
      <Button 
        type="button" 
        onClick={handleButtonClick}
        variant="outline"
        className="w-full h-24 flex flex-col items-center justify-center gap-2 border-dashed"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Upload className="h-6 w-6" />
        )}
        <span>{isLoading ? "Завантаження..." : "Вибрати файли для завантаження"}</span>
      </Button>
      
      <p className="text-sm text-gray-500">
        Оберіть один або кілька файлів зображень
      </p>
    </div>
  );
};
