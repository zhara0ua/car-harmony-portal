
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
  
  // Transmission mapping
  const transmissionMap = {
    "automatic": "Automat",
    "manual": "Manual"
  };

  // Map display names back to backend values
  const getBackendValue = (displayValue: string) => {
    for (const [backendValue, displayName] of Object.entries(transmissionMap)) {
      if (displayName === displayValue) {
        return backendValue;
      }
    }
    return displayValue;
  };

  // Map backend values to display names
  const getDisplayName = (value: string) => {
    return transmissionMap[value as keyof typeof transmissionMap] || value;
  };

  const handleTransmissionChange = (displayValue: string) => {
    if (displayValue === "all_transmissions") {
      onChange(displayValue);
    } else {
      // Convert display name to backend value before sending to parent
      const backendValue = getBackendValue(displayValue);
      onChange(backendValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="transmission">Skrzynia biegów</Label>
      <Select 
        value={value === "all_transmissions" ? value : getDisplayName(value || "")} 
        onValueChange={handleTransmissionChange}
      >
        <SelectTrigger id="transmission" className="w-full">
          <SelectValue placeholder="Wybierz skrzynię biegów" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_transmissions">
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
