
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuctionFileUploaderProps {
  onUploadSuccess?: () => void;
  onSuccess?: () => void;
}

export const AuctionFileUploader = ({ onUploadSuccess, onSuccess }: AuctionFileUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_CARS = 100000; // 100,000 cars

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
          const jsonData = JSON.parse(content);
          
          const rawCars = Array.isArray(jsonData) ? jsonData : [jsonData];
          
          if (rawCars.length > MAX_CARS) {
            toast({
              title: "Błąd",
              description: `Zbyt wiele samochodów w pliku. Maksymalna liczba to ${MAX_CARS}`,
              variant: "destructive",
            });
            event.target.value = '';
            return;
          }
          
          // Filter out invalid cars instead of rejecting the whole file
          const validCars = rawCars.filter(car => car.title && car.detailUrl);
          const skippedCars = rawCars.length - validCars.length;
          
          if (validCars.length === 0) {
            toast({
              title: "Błąd walidacji",
              description: "Brak prawidłowych danych samochodów. Wszystkie samochody w pliku muszą posiadać title i detailUrl.",
              variant: "destructive",
            });
            event.target.value = '';
            setIsLoading(false);
            return;
          }
          
          const cars = validCars.map(car => {
            let price = car.price || 0;
            
            if (typeof price === 'string') {
              price = price.replace(/[^\d.,]/g, '').replace(',', '.');
              price = parseFloat(price) || 0;
            }
            
            if (typeof price === 'number' && price < 100) {
              price = price * 1000;
            }
            
            let endDate;
            try {
              if (!car.endTime) {
                endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
              } else if (typeof car.endTime === 'object') {
                if (car.endTime.fullDate) {
                  const [datePart, timePart] = car.endTime.fullDate.split(' ');
                  const [day, month, year] = datePart.split('/');
                  const [hour, minute] = timePart.split(':');
                  endDate = new Date(
                    parseInt(year), 
                    parseInt(month) - 1, 
                    parseInt(day),
                    parseInt(hour),
                    parseInt(minute)
                  ).toISOString();
                } else {
                  endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                }
              } else {
                endDate = new Date(car.endTime).toISOString();
              }
            } catch (error) {
              console.error("Error parsing endTime:", error);
              endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }
            
            const mileage = typeof car.mileage === 'number' 
              ? car.mileage.toString() 
              : car.mileageFormatted || car.mileage?.toString();
            
            return {
              external_id: car.auctionId || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
              title: car.title,
              start_price: price,
              year: parseInt(car.year) || new Date().getFullYear(),
              make: car.make,
              model: car.model,
              mileage: mileage,
              fuel_type: car.fuel,
              transmission: car.transmission,
              location: car.country || "Unknown",
              image_url: car.imageSrc,
              external_url: car.detailUrl,
              end_date: endDate,
              status: "active"
            };
          });
          
          console.log("Processed cars:", cars.length);
          
          if (cars.length > 0) {
            console.log("Deleting existing auction cars...");
            const { error: deleteError } = await supabase
              .from('auction_cars')
              .delete()
              .neq('id', 0);
            
            if (deleteError) {
              console.error("Error deleting existing cars:", deleteError);
              throw deleteError;
            }
            
            console.log("Successfully deleted existing auction cars");
          }
          
          const BATCH_SIZE = 1000;
          const batches = Math.ceil(cars.length / BATCH_SIZE);
          
          console.log(`Inserting ${cars.length} cars in ${batches} batches`);
          
          for (let i = 0; i < batches; i++) {
            const start = i * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, cars.length);
            const batch = cars.slice(start, end);
            
            console.log(`Inserting batch ${i+1}/${batches} (${batch.length} cars)`);
            
            const { error: insertError } = await supabase
              .from('auction_cars')
              .insert(batch);
            
            if (insertError) {
              console.error("Error inserting cars batch:", insertError);
              throw insertError;
            }
          }
          
          console.log("Successfully inserted all auction cars");
          
          // Include information about skipped cars in success message
          toast({
            title: "Sukces",
            description: `Zaimportowano ${cars.length} samochodów${skippedCars > 0 ? `, pominięto ${skippedCars} nieprawidłowych` : ''}`,
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            type="file"
            accept=".json"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileUpload}
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
      </div>
      
      <div className="text-sm text-muted-foreground">
        Uwaga: Wczytanie nowego pliku spowoduje usunięcie wszystkich istniejących danych. 
        Maksymalny rozmiar pliku: 100MB, maksymalna liczba samochodów: 100,000.
        Samochody bez tytułu (title) lub URL ogłoszenia (detailUrl) zostaną pominięte.
      </div>
    </div>
  );
};
