
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuctionCar } from "@/types/auction-car";

interface AuctionFileUploaderProps {
  onUploadSuccess: () => void;
}

export const AuctionFileUploader = ({ onUploadSuccess }: AuctionFileUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_CARS = 100000; // 100,000 cars

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
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
          
          // Handle both array and single object formats
          const rawCars = Array.isArray(jsonData) ? jsonData : [jsonData];
          
          // Check number of cars
          if (rawCars.length > MAX_CARS) {
            toast({
              title: "Błąd",
              description: `Zbyt wiele samochodów w pliku. Maksymalna liczba to ${MAX_CARS}`,
              variant: "destructive",
            });
            event.target.value = '';
            return;
          }
          
          // Transform the JSON data to match our database structure
          const cars = rawCars.map(car => {
            // Handle price conversion with improved parsing
            let price = car.price || 0;
            
            // If price is a string, clean it and convert to number
            if (typeof price === 'string') {
              // Remove all non-numeric characters except decimal points and commas
              price = price.replace(/[^\d.,]/g, '').replace(',', '.');
              // Try to parse as float first
              price = parseFloat(price) || 0;
            }
            
            // If price is already a number but very small (likely in thousands notation)
            if (typeof price === 'number' && price < 100) {
              price = price * 1000;
            }
            
            // Parse endTime correctly, handling different formats
            let endDate;
            try {
              if (!car.endTime) {
                // Default to 7 days from now if not provided
                endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
              } else if (typeof car.endTime === 'object') {
                // Handle case where endTime is a complex object with a fullDate property
                if (car.endTime.fullDate) {
                  // Parse from a string like "20/03/2025 11:00"
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
                // Assume it's a string that can be parsed directly
                endDate = new Date(car.endTime).toISOString();
              }
            } catch (error) {
              console.error("Error parsing endTime:", error);
              // Default fallback
              endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }
            
            // Parse mileage if it's a number
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
              external_url: car.detailUrl || "#",
              end_date: endDate,
              status: "active"
            };
          });
          
          // Validate each car
          for (const car of cars) {
            if (!car.title || !car.external_url) {
              throw new Error("Each car must have title and external_url");
            }
          }
          
          console.log("Processed cars:", cars.length);
          
          // Delete existing cars if there are any in the import
          if (cars.length > 0) {
            console.log("Deleting existing auction cars...");
            const { error: deleteError } = await supabase
              .from('auction_cars')
              .delete()
              .neq('id', 0); // Delete all rows
            
            if (deleteError) {
              console.error("Error deleting existing cars:", deleteError);
              throw deleteError;
            }
            
            console.log("Successfully deleted existing auction cars");
          }
          
          // Insert new cars - handle in batches of 1000 to avoid payload size limitations
          if (cars.length > 0) {
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
          }
          
          toast({
            title: "Sukces",
            description: `Zaimportowano ${cars.length} samochodów`,
          });
          
          onUploadSuccess();
        } catch (error) {
          console.error("Error processing JSON:", error);
          toast({
            title: "Błąd",
            description: error instanceof Error ? error.message : "Nie udało się przetworzyć pliku JSON",
            variant: "destructive",
          });
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
    } finally {
      setIsLoading(false);
      // Reset the input field
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import samochodów z pliku JSON</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};
