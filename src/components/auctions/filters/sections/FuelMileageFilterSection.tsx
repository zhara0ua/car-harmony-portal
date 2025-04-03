
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FuelTypeFilterComponent } from "./FuelTypeFilterComponent";
import { TransmissionFilterComponent } from "./TransmissionFilterComponent";
import { AuctionFilters } from "@/types/auction-car";

interface FuelMileageFilterSectionProps {
  fuelType?: string;
  transmission?: string;
  minMileage?: number;
  maxMileage?: number;
  onFilterChange: (filters: AuctionFilters) => void;
}

export const FuelMileageFilterSection = ({
  fuelType,
  transmission,
  minMileage,
  maxMileage,
  onFilterChange
}: FuelMileageFilterSectionProps) => {
  const handleFuelTypeChange = (value: string) => {
    console.log(`Setting fuel type filter: ${value}`);
    onFilterChange({ fuelType: value });
  };
  
  const handleTransmissionChange = (value: string) => {
    console.log(`FuelMileageFilterSection: setting transmission to "${value}"`);
    onFilterChange({ transmission: value });
  };
  
  const handleMinMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    onFilterChange({ minMileage: value });
  };
  
  const handleMaxMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    onFilterChange({ maxMileage: value });
  };

  return (
    <div className="space-y-4">
      <FuelTypeFilterComponent
        value={fuelType}
        onChange={handleFuelTypeChange}
      />
      
      <TransmissionFilterComponent
        value={transmission}
        onChange={handleTransmissionChange}
      />
      
      <div className="space-y-2">
        <Label htmlFor="mileage-range">Przebieg (km)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="min-mileage"
            type="number"
            placeholder="Od"
            value={minMileage || ""}
            onChange={handleMinMileageChange}
          />
          <Input
            id="max-mileage"
            type="number"
            placeholder="Do"
            value={maxMileage || ""}
            onChange={handleMaxMileageChange}
          />
        </div>
      </div>
    </div>
  );
};
