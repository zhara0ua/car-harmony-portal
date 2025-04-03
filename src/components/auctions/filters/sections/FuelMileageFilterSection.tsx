
import React from "react";
import { AuctionFilters } from "@/types/auction-car";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransmissionFilterComponent } from "./TransmissionFilterComponent";
import { FuelTypeFilterComponent } from "./FuelTypeFilterComponent";

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
  onFilterChange,
}: FuelMileageFilterSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Fuel Type Filter */}
      <FuelTypeFilterComponent
        value={fuelType}
        onChange={(value) => {
          console.log(`Setting fuel type filter: ${value}`);
          onFilterChange({ fuelType: value });
        }}
      />

      {/* Transmission Filter */}
      <TransmissionFilterComponent
        value={transmission}
        onChange={(value) => {
          console.log(`Setting transmission filter: ${value}`);
          onFilterChange({ transmission: value });
        }}
      />

      {/* Mileage Range Filters */}
      <div className="space-y-2">
        <Label>Przebieg (km)</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              type="number"
              placeholder="Min"
              value={minMileage || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                onFilterChange({ minMileage: value });
              }}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={maxMileage || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                onFilterChange({ maxMileage: value });
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
