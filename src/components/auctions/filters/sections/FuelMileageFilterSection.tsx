
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fuel, Gauge } from "lucide-react";
import { AuctionFilters } from "@/types/auction-car";

interface FuelMileageFilterSectionProps {
  fuelType?: string;
  minMileage?: number;
  maxMileage?: number;
  onFilterChange: (filters: Partial<AuctionFilters>) => void;
}

export const FuelMileageFilterSection = ({
  fuelType,
  minMileage,
  maxMileage,
  onFilterChange
}: FuelMileageFilterSectionProps) => {
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  
  // Load fuel types on component mount
  useEffect(() => {
    const fetchFuelTypes = async () => {
      const { data: fuelData, error: fuelError } = await supabase
        .from('auction_cars')
        .select('fuel_type')
        .not('fuel_type', 'is', null);
      
      if (fuelError) {
        console.error('Error fetching fuel types:', fuelError);
        return;
      }
      
      // Extract unique fuel types
      const uniqueFuelTypes = Array.from(
        new Set(fuelData.map(item => item.fuel_type).filter(Boolean))
      ).sort() as string[];
      
      setFuelTypes(uniqueFuelTypes);
    };
    
    fetchFuelTypes();
  }, []);
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fuelType" className="flex items-center gap-1">
          <Fuel className="h-4 w-4" /> Paliwo
        </Label>
        <Select
          value={fuelType}
          onValueChange={(value) => onFilterChange({ fuelType: value })}
        >
          <SelectTrigger id="fuelType">
            <SelectValue placeholder="Wszystkie rodzaje" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_fuel_types">Wszystkie rodzaje</SelectItem>
            {fuelTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="minMileage" className="flex items-center gap-1">
          <Gauge className="h-4 w-4" /> Przebieg od
        </Label>
        <Input
          id="minMileage"
          type="number"
          placeholder="0"
          value={minMileage || ''}
          onChange={(e) => onFilterChange({ minMileage: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maxMileage">Przebieg do</Label>
        <Input
          id="maxMileage"
          type="number"
          placeholder="500000"
          value={maxMileage || ''}
          onChange={(e) => onFilterChange({ maxMileage: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </>
  );
};
