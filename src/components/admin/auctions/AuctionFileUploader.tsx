
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          
          // Handle both array and single object formats
          const rawCars = Array.isArray(jsonData) ? jsonData : [jsonData];
          
          // Transform the JSON data to match our database structure
          const cars = rawCars.map(car => {
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
            
            return {
              external_id: car.auctionId || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
              title: car.title,
              start_price: car.price || 0,
              year: parseInt(car.year) || new Date().getFullYear(),
              make: car.make,
              model: car.model,
              mileage: car.mileageFormatted || car.mileage?.toString(),
              fuel_type: car.fuel,
              transmission: car.transmission,
              location: car.country,
              image_url: car.imageSrc,
              external_url: car.detailUrl || "#",
              end_date: endDate,
              status: "active"
            };
          });
          
          // Validate each car
          for (const car of cars) {
            if (!car.title || !car.external_url || car.start_price === undefined) {
              throw new Error("Each car must have title, start_price, and external_url");
            }
          }
          
          // Delete existing cars if there are any in the import
          if (cars.length > 0) {
            const { error: deleteError } = await supabase
              .from('auction_cars')
              .delete()
              .neq('id', 0); // Delete all rows
            
            if (deleteError) throw deleteError;
          }
          
          // Insert new cars
          if (cars.length > 0) {
            const { error: insertError } = await supabase
              .from('auction_cars')
              .insert(cars);
            
            if (insertError) throw insertError;
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
        </div>
      </CardContent>
    </Card>
  );
};
