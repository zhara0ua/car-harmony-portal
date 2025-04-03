
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
  // Fuel type options
  const fuelTypes = [
    { value: "petrol", label: "Benzyna" },
    { value: "diesel", label: "Diesel" },
    { value: "electric", label: "Elektryczny" },
    { value: "hybrid", label: "Hybryda" },
    { value: "lpg", label: "LPG" },
  ];

  return (
    <div className="space-y-4">
      {/* Fuel Type Filter */}
      <div className="space-y-2">
        <Label htmlFor="fuel-type">Rodzaj paliwa</Label>
        <Select
          value={fuelType}
          onValueChange={(value) => onFilterChange({ fuelType: value })}
        >
          <SelectTrigger id="fuel-type" className="w-full">
            <SelectValue placeholder="Wybierz paliwo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_fuel_types">Wszystkie paliwa</SelectItem>
            {fuelTypes.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
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
