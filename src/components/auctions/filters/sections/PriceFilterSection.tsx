
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuctionFilters } from "@/types/auction-car";

interface PriceFilterSectionProps {
  minPrice?: number;
  maxPrice?: number;
  onFilterChange: (filters: Partial<AuctionFilters>) => void;
}

export const PriceFilterSection = ({
  minPrice,
  maxPrice,
  onFilterChange
}: PriceFilterSectionProps) => {
  return (
    <>
      <div className="space-y-2 mb-4">
        <Label htmlFor="minPrice">Cena od</Label>
        <Input
          id="minPrice"
          type="number"
          placeholder="0"
          value={minPrice || ''}
          onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maxPrice">Cena do</Label>
        <Input
          id="maxPrice"
          type="number"
          placeholder="500000"
          value={maxPrice || ''}
          onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </>
  );
};
