
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface Filters {
  make: string;
  model: string;
  minYear: number;
  maxYear: number;
  minPrice: number;
  maxPrice: number;
  minMileage: number;
  maxMileage: number;
}

interface ScrapedCarsFiltersProps {
  onFiltersChange: (filters: Filters) => void;
}

const ScrapedCarsFilters: React.FC<ScrapedCarsFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<Filters>({
    make: '',
    model: '',
    minYear: 0,
    maxYear: 0,
    minPrice: 0,
    maxPrice: 0,
    minMileage: 0,
    maxMileage: 0,
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('min') || name.startsWith('max')) {
      setFilters({ ...filters, [name]: Number(value) || 0 });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="make">Make:</Label>
        <Input type="text" id="make" name="make" value={filters.make} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="model">Model:</Label>
        <Input type="text" id="model" name="model" value={filters.model} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="minYear">Min Year:</Label>
        <Input type="number" id="minYear" name="minYear" value={filters.minYear} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="maxYear">Max Year:</Label>
        <Input type="number" id="maxYear" name="maxYear" value={filters.maxYear} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="minPrice">Min Price:</Label>
        <Input type="number" id="minPrice" name="minPrice" value={filters.minPrice} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="maxPrice">Max Price:</Label>
        <Input type="number" id="maxPrice" name="maxPrice" value={filters.maxPrice} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="minMileage">Min Mileage:</Label>
        <Input type="number" id="minMileage" name="minMileage" value={filters.minMileage} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="maxMileage">Max Mileage:</Label>
        <Input type="number" id="maxMileage" name="maxMileage" value={filters.maxMileage} onChange={handleInputChange} />
      </div>
    </div>
  );
};

export default ScrapedCarsFilters;
