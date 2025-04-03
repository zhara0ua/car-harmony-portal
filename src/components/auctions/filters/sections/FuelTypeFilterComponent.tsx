
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
  
  // Fuel type mapping - backend values to display names
  const fuelTypeMap = {
    "petrol": "Benzyna",
    "diesel": "Diesel",
    "electric": "Elektryczny",
    "hybrid": "Hybryda",
    "lpg": "LPG"
  };

  // Map display names back to backend values
  const getBackendValue = (displayValue: string) => {
    for (const [backendValue, displayName] of Object.entries(fuelTypeMap)) {
      if (displayName === displayValue) {
        return backendValue;
      }
    }
    return displayValue;
  };

  // Map backend values to display names
  const getDisplayName = (value: string) => {
    return fuelTypeMap[value as keyof typeof fuelTypeMap] || value;
  };

  const handleFuelTypeChange = (selectedValue: string) => {
    if (selectedValue === "all_fuel_types") {
      onChange(selectedValue);
    } else {
      // Convert display name to backend value before sending to parent
      const backendValue = getBackendValue(selectedValue);
      console.log(`Fuel type selected: ${selectedValue} -> backend value: ${backendValue}`);
      onChange(backendValue);
    }
  };

  // Determine what to display in the select
  const displayValue = value === "all_fuel_types" 
    ? value 
    : value 
      ? getDisplayName(value) 
      : undefined;

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
          <SelectItem value="all_fuel_types">Wszystkie paliwa</SelectItem>
          {fuelTypes.map((item) => (
            <SelectItem key={item} value={getDisplayName(item)}>
              {getDisplayName(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
