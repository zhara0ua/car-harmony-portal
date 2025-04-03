
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

interface TransmissionFilterComponentProps {
  value?: string;
  onChange: (value: string) => void;
}

export const TransmissionFilterComponent = ({
  value,
  onChange,
}: TransmissionFilterComponentProps) => {
  const { transmissions, isLoading } = useFilterData();
  
  // Transmission mapping - backend values to display names
  const transmissionMap: Record<string, string> = {
    "automatic": "Automat",
    "manual": "Manual"
  };

  // Map display names back to backend values
  const getBackendValue = (displayValue: string) => {
    // Check if it's the "all" option
    if (displayValue === "Wszystkie skrzynie biegów") {
      return "all_transmissions";
    }
    
    // Look up in the map
    for (const [backendValue, displayName] of Object.entries(transmissionMap)) {
      if (displayName === displayValue) {
        return backendValue;
      }
    }
    
    // If not found, return as is (shouldn't happen with controlled options)
    return displayValue;
  };

  // Map backend values to display names
  const getDisplayName = (value: string) => {
    // Check if it's the "all" option
    if (value === "all_transmissions") {
      return "Wszystkie skrzynie biegów";
    }
    
    // Return the mapped display name or the original value if not found
    return transmissionMap[value] || value;
  };

  const handleTransmissionChange = (selectedValue: string) => {
    // Convert display name to backend value before sending to parent
    const backendValue = getBackendValue(selectedValue);
    console.log(`Transmission selected: ${selectedValue} -> backend value: ${backendValue}`);
    onChange(backendValue);
  };

  // Determine what to display in the select
  const displayValue = value ? getDisplayName(value) : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor="transmission">Skrzynia biegów</Label>
      <Select 
        value={displayValue} 
        onValueChange={handleTransmissionChange}
      >
        <SelectTrigger id="transmission" className="w-full">
          <SelectValue placeholder="Wybierz skrzynię biegów" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Wszystkie skrzynie biegów">
            Wszystkie skrzynie biegów
          </SelectItem>
          {transmissions.map((item) => (
            <SelectItem key={item} value={getDisplayName(item)}>
              {getDisplayName(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
