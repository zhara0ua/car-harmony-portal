
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";

export const JsonFormatInfo = () => {
  return (
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
  );
};
