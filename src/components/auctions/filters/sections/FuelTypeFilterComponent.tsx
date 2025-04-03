
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterData } from "@/components/auctions/filters/useFilterData";

interface FuelTypeFilterComponentProps {
  value?: string;
  onChange: (value: string) => void;
}

export const FuelTypeFilterComponent = ({
  value,
  onChange,
}: FuelTypeFilterComponentProps) => {
  const { fuelTypes, isLoading } = useFilterData();
  
  // Fuel type mapping - preserving exact case for database values
  const fuelTypeMap: Record<string, string> = {
    "petrol": "Benzyna",
    "diesel": "Diesel",  // Keep Diesel capitalized
    "electric": "Elektryczny",
    "hybrid": "Hybryda",
    "lpg": "LPG"
  };

  // Map display names back to backend values - preserving case for Diesel
  const getBackendValue = (displayValue: string) => {
    // Special case for all fuel types
    if (displayValue === "Wszystkie paliwa") {
      return "all_fuel_types";
    }
    
    // Special case for Diesel - preserve exact case
    if (displayValue === "Diesel") {
      return "diesel";
    }
    
    // For other values, check mapping
    for (const [backendValue, displayName] of Object.entries(fuelTypeMap)) {
      if (displayName === displayValue) {
        return backendValue;
      }
    }
    
    // If no match found, return as is
    return displayValue;
  };

  // Map backend values to display names
  const getDisplayName = (value: string) => {
    if (value === "all_fuel_types") {
      return "Wszystkie paliwa";
    }
    return fuelTypeMap[value as keyof typeof fuelTypeMap] || value;
  };

  const handleFuelTypeChange = (selectedValue: string) => {
    const backendValue = getBackendValue(selectedValue);
    console.log(`FuelType selected: "${selectedValue}" -> backend value: "${backendValue}"`);
    onChange(backendValue);
  };

  // Determine what to display in the select
  const displayValue = value ? getDisplayName(value) : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor="fuel-type">Rodzaj paliwa</Label>
      <Select 
        value={displayValue} 
        onValueChange={handleFuelTypeChange}
      >
        <SelectTrigger id="fuel-type" className="w-full">
          <SelectValue placeholder="Wybierz paliwo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Wszystkie paliwa">Wszystkie paliwa</SelectItem>
          <SelectItem value="Benzyna">Benzyna</SelectItem>
          <SelectItem value="Diesel">Diesel</SelectItem>
          <SelectItem value="Elektryczny">Elektryczny</SelectItem>
          <SelectItem value="Hybryda">Hybryda</SelectItem>
          <SelectItem value="LPG">LPG</SelectItem>
          {fuelTypes
            .filter(f => 
              f.toLowerCase() !== "petrol" && 
              f.toLowerCase() !== "diesel" && 
              f.toLowerCase() !== "electric" && 
              f.toLowerCase() !== "hybrid" && 
              f.toLowerCase() !== "lpg"
            )
            .map((fuelType) => (
              <SelectItem key={fuelType} value={fuelType}>
                {fuelType}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
