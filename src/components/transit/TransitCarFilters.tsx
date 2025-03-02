
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, FilterX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TransitCar } from "./types";

interface TransitCarFiltersProps {
  cars: TransitCar[];
  onFilterChange: (filteredCars: TransitCar[]) => void;
}

const TransitCarFilters = ({ cars, onFilterChange }: TransitCarFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [make, setMake] = useState("all");
  const [status, setStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Get unique makes from the cars array
  const uniqueMakes = Array.from(new Set(cars.map((car) => car.make)));

  const applyFilters = () => {
    let filteredCars = [...cars];

    // Filter by make
    if (make !== "all") {
      filteredCars = filteredCars.filter((car) => car.make === make);
    }

    // Filter by status
    if (status !== "all") {
      filteredCars = filteredCars.filter((car) => car.status === status);
    }

    // Filter by min price
    if (minPrice) {
      filteredCars = filteredCars.filter(
        (car) => car.auctionPrice >= parseInt(minPrice)
      );
    }

    // Filter by max price
    if (maxPrice) {
      filteredCars = filteredCars.filter(
        (car) => car.auctionPrice <= parseInt(maxPrice)
      );
    }

    onFilterChange(filteredCars);
  };

  const resetFilters = () => {
    setMake("all");
    setStatus("all");
    setMinPrice("");
    setMaxPrice("");
    onFilterChange(cars);
  };

  // Apply filters whenever filter values change
  useState(() => {
    applyFilters();
  }, [make, status, minPrice, maxPrice]);

  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-navy hover:text-navy/80 transition-colors mb-4">
          <span className="font-medium">Фільтри</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Марка</Label>
              <Select value={make} onValueChange={(value) => setMake(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть марку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі марки</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі статуси</SelectItem>
                  <SelectItem value="loading">Завантаження</SelectItem>
                  <SelectItem value="in_transit">В дорозі</SelectItem>
                  <SelectItem value="customs">На митниці</SelectItem>
                  <SelectItem value="delivery">Доставка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ціна від</Label>
              <Input
                type="number"
                placeholder="Мінімальна ціна"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Ціна до</Label>
              <Input
                type="number"
                placeholder="Максимальна ціна"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={resetFilters}
            >
              <FilterX className="h-4 w-4" />
              Скинути
            </Button>
            <Button onClick={applyFilters}>Застосувати</Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TransitCarFilters;
