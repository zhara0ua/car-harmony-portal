
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuctionFilters } from "@/types/auction-car";

interface YearFilterSectionProps {
  minYear?: number;
  maxYear?: number;
  onFilterChange: (filters: Partial<AuctionFilters>) => void;
}

export const YearFilterSection = ({
  minYear,
  maxYear,
  onFilterChange
}: YearFilterSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="minYear">Rok od</Label>
        <Input
          id="minYear"
          type="number"
          placeholder="2010"
          value={minYear || ''}
          onChange={(e) => onFilterChange({ minYear: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maxYear">Rok do</Label>
        <Input
          id="maxYear"
          type="number"
          placeholder="2025"
          value={maxYear || ''}
          onChange={(e) => onFilterChange({ maxYear: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </>
  );
};
