
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

  // Map backend values to display names
  const getDisplayName = (value: string) => {
    return transmissionMap[value as keyof typeof transmissionMap] || value;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="transmission">Skrzynia biegów</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="transmission" className="w-full">
          <SelectValue placeholder="Wybierz skrzynię biegów" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_transmissions">
            Wszystkie skrzynie biegów
          </SelectItem>
          {transmissions.map((item) => (
            <SelectItem key={item} value={item}>
              {getDisplayName(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
