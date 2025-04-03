
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadTabProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadTab = ({ onFileChange }: FileUploadTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
          onChange={onFileChange}
        />
      </div>
      
      <Button 
        type="button" 
        onClick={handleButtonClick}
        variant="outline"
        className="w-full h-24 flex flex-col items-center justify-center gap-2 border-dashed"
      >
        <Upload className="h-6 w-6" />
        <span>Вибрати файли для завантаження</span>
      </Button>
      
      <p className="text-sm text-gray-500">
        Оберіть один або кілька файлів зображень
      </p>
    </div>
  );
};
