
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
    "Automatic": "Automatic",
    "Manual": "Manual"
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
    // Special case for "Wszystkie skrzynie biegów"
    if (displayName === "Wszystkie skrzynie biegów") {
      return "all_transmissions";
    }
    
    // Special case for "Manual"
    if (displayName === "Manual") {
      return "Manual";
    }
    
    // Special case for "Automat"
    if (displayName === "Automat") {
      return "automatic";
    }
    
    // For other values, check the mapping or return as is (lowercase)
    for (const [backend, display] of Object.entries(transmissionMap)) {
      if (display === displayName) {
        return backend;
      }
    }
    
    // Return lowercase for any other value
    return displayName.toLowerCase();
  };

  const handleTransmissionChange = (selectedValue: string) => {
    const backendValue = getBackendValue(selectedValue);
    console.log(`TransmissionFilter: selected "${selectedValue}" -> backend value: "${backendValue}"`);
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
          <SelectItem value="Manual">Manual</SelectItem>
          <SelectItem value="Automatic">Automatic</SelectItem>
          {transmissions
            .filter(t => t.toLowerCase() !== "manual" && t.toLowerCase() !== "automatic")
            .map((transmission) => (
              <SelectItem key={transmission} value={getDisplayName(transmission)}>
                {getDisplayName(transmission)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
