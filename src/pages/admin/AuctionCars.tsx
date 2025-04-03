
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { AuctionCar } from "@/types/auction-car";
import { FileJson, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AuctionCars() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: cars, refetch } = useQuery({
    queryKey: ['admin-auction-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auction_cars')
        .select('*')
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      return data as AuctionCar[];
    }
  });

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
          const cars = rawCars.map(car => ({
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
            end_date: car.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days from now
            status: "active"
          }));
          
          // Validate each car
          for (const car of cars) {
            if (!car.title || !car.external_url || car.start_price === undefined || !car.end_date) {
              throw new Error("Each car must have title, start_price, external_url, and end_date");
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
          
          refetch();
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Zarządzanie aukcjami</h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex gap-2 items-center">
              <FileJson size={18} />
              Instrukcja JSON
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Format pliku JSON</SheetTitle>
              <SheetDescription>
                Plik JSON powinien zawierać pojedynczy samochód lub tablicę samochodów z następującymi polami:
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
{`{
  "title": "Mercedes-Benz A 180d AMG Line",
  "make": "Mercedes-Benz",
  "model": "A 180d AMG Line",
  "price": 20000,
  "priceFormatted": "€20,000",
  "fuel": "Diesel",
  "transmission": "Automatic",
  "mileage": 55439,
  "mileageFormatted": "55.439 km",
  "imageSrc": "https://example.com/image.jpg",
  "detailUrl": "https://example.com/car/123",
  "year": "2020",
  "power": "85 kW (116 hp)",
  "bodyType": "Saloon",
  "vatStatus": "VAT excluded",
  "country": "Poland",
  "emissions": "119 g/km (EU6)",
  "timestamp": "2025-03-18T15:53:25.815Z",
  "auctionType": "Buy now",
  "premiumOffers": ["Best description"],
  "endTime": "2025-04-10T15:53:25.815Z",
  "photoCount": 144
}`}
              </pre>
            </div>
            <SheetFooter>
              <p className="text-xs text-muted-foreground">
                Pola wymagane: title, price, year, detailUrl
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
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
      
      <Card>
        <CardHeader>
          <CardTitle>Lista samochodów ({cars?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {cars?.length ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Rok</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead>Data zakończenia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.external_id}</TableCell>
                      <TableCell>{car.title}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.start_price} zł</TableCell>
                      <TableCell>{new Date(car.end_date).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              Brak samochodów w bazie danych
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
