
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FuelTypeFilterComponent } from "@/components/auctions/filters/sections/FuelTypeFilterComponent";
import { TransmissionFilterComponent } from "@/components/auctions/filters/sections/TransmissionFilterComponent";
import { AuctionFilters } from "@/types/auction-car";

interface FuelMileageFilterSectionProps {
  fuelType?: string;
  minMileage?: number;
  maxMileage?: number;
  transmission?: string;
  onFilterChange: (filters: AuctionFilters) => void;
}

export const FuelMileageFilterSection = ({
  fuelType,
  minMileage,
  maxMileage,
  transmission,
  onFilterChange
}: FuelMileageFilterSectionProps) => {
  const handleFuelTypeChange = (value: string) => {
    onFilterChange({ fuelType: value });
  };
  
  const handleTransmissionChange = (value: string) => {
    console.log(`FuelMileageFilterSection: setting transmission to ${value}`);
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
    <>
      <FuelTypeFilterComponent
        value={fuelType}
        onChange={handleFuelTypeChange}
      />
      
      <TransmissionFilterComponent
        value={transmission}
        onChange={handleTransmissionChange}
      />
      
      <div className="space-y-2">
        <Label htmlFor="min-mileage">Przebieg od (km)</Label>
        <Input
          type="number"
          id="min-mileage"
          placeholder="Od"
          value={minMileage || ''}
          onChange={handleMinMileageChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="max-mileage">Przebieg do (km)</Label>
        <Input
          type="number"
          id="max-mileage"
          placeholder="Do"
          value={maxMileage || ''}
          onChange={handleMaxMileageChange}
        />
      </div>
    </>
  );
};
