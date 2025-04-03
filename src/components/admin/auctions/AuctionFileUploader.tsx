
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FileInputButton } from "./FileInputButton";
import { FileUploaderInfo } from "./FileUploaderInfo";
import { processAuctionJsonData, uploadAuctionCars, MAX_FILE_SIZE } from "@/utils/auctionFileProcessing";
import { JsonFormatInfo } from "./JsonFormatInfo";

interface AuctionFileUploaderProps {
  onUploadSuccess?: () => void;
  onSuccess?: () => void;
}

export const AuctionFileUploader = ({ onUploadSuccess, onSuccess }: AuctionFileUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    if (onUploadSuccess) {
      onUploadSuccess();
    } else if (onSuccess) {
      onSuccess();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Błąd",
        description: `Plik jest za duży. Maksymalny rozmiar to ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    try {
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const { cars, skippedCars } = await processAuctionJsonData(content);
          
          const uploadedCarsCount = await uploadAuctionCars(cars);
          
          // Include information about skipped cars in success message
          toast({
            title: "Sukces",
            description: `Zaimportowano ${uploadedCarsCount} samochodów${skippedCars > 0 ? `, pominięto ${skippedCars} nieprawidłowych` : ''}`,
          });
          
          handleSuccess();
        } catch (error) {
          console.error("Error processing JSON:", error);
          toast({
            title: "Błąd",
            description: error instanceof Error ? error.message : "Nie udało się przetworzyć pliku JSON",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
          event.target.value = '';
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas wczytywania pliku",
        variant: "destructive",
      });
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 justify-between">
        <FileInputButton 
          isLoading={isLoading} 
          onFileSelect={handleFileUpload} 
        />
        <JsonFormatInfo />
      </div>
      
      <FileUploaderInfo />
    </div>
  );
};
