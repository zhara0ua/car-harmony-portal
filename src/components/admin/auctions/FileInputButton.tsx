
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileInputButtonProps {
  isLoading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileInputButton = ({ isLoading, onFileSelect }: FileInputButtonProps) => {
  return (
    <div className="relative flex-1">
      <Input
        type="file"
        accept=".json"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onFileSelect}
        disabled={isLoading}
      />
      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Upload className="h-4 w-4 animate-spin" />
            Wczytywanie...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Wybierz plik JSON
          </>
        )}
      </Button>
    </div>
  );
};
