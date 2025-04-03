
import { useState } from "react";
import { AuctionFilters as AuctionFiltersType } from "@/types/auction-car";
import { AuctionFilterCard } from "@/components/auctions/filters/AuctionFilterCard";

interface AuctionFiltersProps {
  onFilterChange: (filters: AuctionFiltersType) => void;
}

export function AuctionFilters({ onFilterChange }: AuctionFiltersProps) {
  const [filters, setFilters] = useState<AuctionFiltersType>({});
  
  const handleFilterChange = (key: keyof AuctionFiltersType, value: any) => {
    // If clearing the make, also clear the model
    if (key === 'make' && !value) {
      setFilters(prev => ({ ...prev, [key]: value, model: undefined }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  
  const handleApplyFilters = () => {
    onFilterChange(filters);
  };
  
  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };
  
  return (
    <AuctionFilterCard
      filters={filters}
      onFilterChange={(partialFilters) => {
        setFilters(prev => ({ ...prev, ...partialFilters }));
      }}
      handleApplyFilters={handleApplyFilters}
      handleClearFilters={handleClearFilters}
    />
  );
}
