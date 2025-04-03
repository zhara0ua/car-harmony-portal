
import React from "react";
import { AuctionFilters } from "@/types/auction-car";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransmissionFilterComponent } from "./TransmissionFilterComponent";

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
  // Fuel type mapping between display names and backend values
  const fuelTypeMap = {
    "petrol": "Benzyna",
    "diesel": "Diesel",
    "electric": "Elektryczny",
    "hybrid": "Hybryda",
    "lpg": "LPG"
  };

  // Function to get the display name from backend value
  const getDisplayName = (value?: string) => {
    if (!value || value === 'all_fuel_types') return undefined;
    return fuelTypeMap[value as keyof typeof fuelTypeMap] || value;
  };

  // Function to get the backend value from display name
  const getBackendValue = (displayValue: string) => {
    for (const [backendValue, displayName] of Object.entries(fuelTypeMap)) {
      if (displayName === displayValue) {
        return backendValue;
      }
    }
    return displayValue;
  };

  const handleFuelTypeChange = (displayValue: string) => {
    if (displayValue === "all_fuel_types") {
      onFilterChange({ fuelType: displayValue });
    } else {
      // Convert display name to backend value
      const backendValue = getBackendValue(displayValue);
      onFilterChange({ fuelType: backendValue });
    }
  };

  return (
    <div className="space-y-4">
      {/* Fuel Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="fuel-type">Rodzaj paliwa</Label>
        <Select
          value={fuelType === "all_fuel_types" ? fuelType : getDisplayName(fuelType)}
          onValueChange={handleFuelTypeChange}
        >
          <SelectTrigger id="fuel-type" className="w-full">
            <SelectValue placeholder="Wybierz paliwo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_fuel_types">Wszystkie paliwa</SelectItem>
            {Object.entries(fuelTypeMap).map(([backendValue, displayName]) => (
              <SelectItem key={backendValue} value={displayName}>
                {displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transmission Filter */}
      <TransmissionFilterComponent
        value={transmission}
        onChange={(value) => onFilterChange({ transmission: value })}
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
