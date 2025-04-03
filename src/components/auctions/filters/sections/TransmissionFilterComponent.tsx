
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

  // Map backend values to display names
  const getDisplayName = (backendValue: string) => {
    if (backendValue === "all_transmissions") {
      return "Wszystkie skrzynie biegów";
    }
    return transmissionMap[backendValue] || backendValue;
  };

  // Map display names back to backend values
  const getBackendValue = (displayName: string) => {
    if (displayName === "Wszystkie skrzynie biegów") {
      return "all_transmissions";
    }
    
    // Find backend value by display name
    const entry = Object.entries(transmissionMap).find(([_, display]) => display === displayName);
    console.log(`Finding backend value for "${displayName}". Result:`, entry);
    return entry ? entry[0] : displayName;
  };

  const handleTransmissionChange = (selectedValue: string) => {
    const backendValue = getBackendValue(selectedValue);
    console.log(`Transmission selected: ${selectedValue} -> backend value: ${backendValue}`);
    console.log(`Setting transmission filter: ${backendValue}`);
    onChange(backendValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="transmission">Skrzynia biegów</Label>
      <Select 
        value={value ? getDisplayName(value) : undefined} 
        onValueChange={handleTransmissionChange}
      >
        <SelectTrigger id="transmission" className="w-full">
          <SelectValue placeholder="Wybierz skrzynię biegów" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Wszystkie skrzynie biegów">
            Wszystkie skrzynie biegów
          </SelectItem>
          {transmissions.map((transmission) => (
            <SelectItem key={transmission} value={getDisplayName(transmission)}>
              {getDisplayName(transmission)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
