
import React from "react";
import { PriceFilterSection } from "@/components/auctions/filters/sections/PriceFilterSection";
import { YearFilterSection } from "@/components/auctions/filters/sections/YearFilterSection";
import { MakeModelFilterSection } from "@/components/auctions/filters/sections/MakeModelFilterSection";
import { FuelMileageFilterSection } from "@/components/auctions/filters/sections/FuelMileageFilterSection";
import { AuctionFilters } from "@/types/auction-car";

interface FilterSectionsProps {
  filters: AuctionFilters;
  onFilterChange: (filters: AuctionFilters) => void;
}

export const FilterSections = ({ filters, onFilterChange }: FilterSectionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <PriceFilterSection
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onFilterChange={onFilterChange}
      />
      
      <YearFilterSection
        minYear={filters.minYear}
        maxYear={filters.maxYear}
        onFilterChange={onFilterChange}
      />
      
      <MakeModelFilterSection
        make={filters.make}
        model={filters.model}
        onFilterChange={onFilterChange}
      />
      
      <FuelMileageFilterSection
        fuelType={filters.fuelType}
        minMileage={filters.minMileage}
        maxMileage={filters.maxMileage}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};
