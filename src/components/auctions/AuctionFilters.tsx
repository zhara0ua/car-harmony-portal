
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuctionFilters as AuctionFiltersType } from "@/types/auction-car";
import { Fuel, Gauge } from "lucide-react";

interface AuctionFiltersProps {
  onFilterChange: (filters: AuctionFiltersType) => void;
}

export function AuctionFilters({ onFilterChange }: AuctionFiltersProps) {
  const [filters, setFilters] = useState<AuctionFiltersType>({});
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  
  // Load makes and fuel types on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch makes
      const { data: makesData, error: makesError } = await supabase
        .from('auction_cars')
        .select('make')
        .not('make', 'is', null);
      
      if (makesError) {
        console.error('Error fetching makes:', makesError);
        return;
      }
      
      // Extract unique makes
      const uniqueMakes = Array.from(
        new Set(makesData.map(item => item.make).filter(Boolean))
      ).sort() as string[];
      
      setMakes(uniqueMakes);
      
      // Fetch fuel types
      const { data: fuelData, error: fuelError } = await supabase
        .from('auction_cars')
        .select('fuel_type')
        .not('fuel_type', 'is', null);
      
      if (fuelError) {
        console.error('Error fetching fuel types:', fuelError);
        return;
      }
      
      // Extract unique fuel types
      const uniqueFuelTypes = Array.from(
        new Set(fuelData.map(item => item.fuel_type).filter(Boolean))
      ).sort() as string[];
      
      setFuelTypes(uniqueFuelTypes);
    };
    
    fetchData();
  }, []);
  
  // Load models when make changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!filters.make) {
        setModels([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('auction_cars')
        .select('model')
        .eq('make', filters.make)
        .not('model', 'is', null);
      
      if (error) {
        console.error('Error fetching models:', error);
        return;
      }
      
      // Extract unique models
      const uniqueModels = Array.from(
        new Set(data.map(item => item.model).filter(Boolean))
      ).sort() as string[];
      
      setModels(uniqueModels);
    };
    
    if (filters.make && filters.make !== "all_makes") {
      fetchModels();
    }
  }, [filters.make]);
  
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
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minPrice">Cena od</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Cena do</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="500000"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minYear">Rok od</Label>
            <Input
              id="minYear"
              type="number"
              placeholder="2010"
              value={filters.minYear || ''}
              onChange={(e) => handleFilterChange('minYear', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxYear">Rok do</Label>
            <Input
              id="maxYear"
              type="number"
              placeholder="2025"
              value={filters.maxYear || ''}
              onChange={(e) => handleFilterChange('maxYear', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="make">Marka</Label>
            <Select
              value={filters.make}
              onValueChange={(value) => handleFilterChange('make', value)}
            >
              <SelectTrigger id="make">
                <SelectValue placeholder="Wybierz markę" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_makes">Wszystkie marki</SelectItem>
                {makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={filters.model}
              onValueChange={(value) => handleFilterChange('model', value)}
              disabled={!filters.make || filters.make === "all_makes"}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Wybierz model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_models">Wszystkie modele</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fuelType" className="flex items-center gap-1">
              <Fuel className="h-4 w-4" /> Paliwo
            </Label>
            <Select
              value={filters.fuelType}
              onValueChange={(value) => handleFilterChange('fuelType', value)}
            >
              <SelectTrigger id="fuelType">
                <SelectValue placeholder="Wszystkie rodzaje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_fuel_types">Wszystkie rodzaje</SelectItem>
                {fuelTypes.map((fuelType) => (
                  <SelectItem key={fuelType} value={fuelType}>
                    {fuelType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minMileage" className="flex items-center gap-1">
              <Gauge className="h-4 w-4" /> Przebieg od
            </Label>
            <Input
              id="minMileage"
              type="number"
              placeholder="0"
              value={filters.minMileage || ''}
              onChange={(e) => handleFilterChange('minMileage', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxMileage">Przebieg do</Label>
            <Input
              id="maxMileage"
              type="number"
              placeholder="500000"
              value={filters.maxMileage || ''}
              onChange={(e) => handleFilterChange('maxMileage', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          
          <div className="space-y-2 flex items-end">
            <Button onClick={handleApplyFilters} className="w-full">
              Zastosuj filtry
            </Button>
          </div>
          
          <div className="space-y-2 flex items-end">
            <Button onClick={handleClearFilters} variant="outline" className="w-full">
              Wyczyść filtry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
