
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSections } from "@/components/auctions/filters/FilterSections";
import { FilterActions } from "@/components/auctions/filters/FilterActions";
import { AuctionFilters as AuctionFiltersType } from "@/types/auction-car";

interface AuctionFilterCardProps {
  filters: AuctionFiltersType;
  onFilterChange: (filters: AuctionFiltersType) => void;
  handleClearFilters: () => void;
  handleApplyFilters: () => void;
}

export const AuctionFilterCard = ({
  filters,
  onFilterChange,
  handleClearFilters,
  handleApplyFilters
}: AuctionFilterCardProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <FilterSections 
          filters={filters} 
          onFilterChange={onFilterChange} 
        />
        <FilterActions 
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </CardContent>
    </Card>
  );
};
