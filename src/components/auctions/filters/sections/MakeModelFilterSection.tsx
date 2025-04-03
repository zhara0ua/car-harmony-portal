
import React from "react";
import { AuctionFilters } from "@/types/auction-car";
import { MakeFilterComponent } from "@/components/auctions/filters/sections/MakeFilterComponent";
import { ModelFilterComponent } from "@/components/auctions/filters/sections/ModelFilterComponent";

interface MakeModelFilterSectionProps {
  make?: string;
  model?: string;
  onFilterChange: (filters: Partial<AuctionFilters>) => void;
}

export const MakeModelFilterSection = ({
  make,
  model,
  onFilterChange
}: MakeModelFilterSectionProps) => {
  const handleMakeChange = (value: string) => {
    if (value !== make) {
      onFilterChange({ 
        make: value,
        model: undefined  // Reset model when make changes
      });
    }
  };
  
  const handleModelChange = (value: string) => {
    onFilterChange({ model: value });
  };
  
  return (
    <>
      <MakeFilterComponent 
        value={make} 
        onChange={handleMakeChange} 
      />
      
      <ModelFilterComponent 
        makeValue={make}
        modelValue={model}
        onChange={handleModelChange}
      />
    </>
  );
};
