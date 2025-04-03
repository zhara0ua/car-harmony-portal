
import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface FileUploadTabProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadTab = ({ onFileChange }: FileUploadTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="flex flex-col space-y-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
      />
      <p className="text-sm text-gray-500">
        Оберіть один або кілька файлів зображень
      </p>
    </div>
  );
};
