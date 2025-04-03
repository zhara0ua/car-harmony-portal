
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuctionFilters as AuctionFiltersType } from "@/types/auction-car";
import { supabase } from "@/integrations/supabase/client";

interface AuctionFiltersProps {
  onFilterChange: (filters: AuctionFiltersType) => void;
}

export const AuctionFilters = ({ onFilterChange }: AuctionFiltersProps) => {
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    // Fetch available makes
    const fetchMakes = async () => {
      const { data, error } = await supabase
        .from('auction_cars')
        .select('make')
        .order('make', { ascending: true });
        
      if (error) {
        console.error('Error fetching makes:', error);
        return;
      }
        
      const uniqueMakes = [...new Set(data.map(item => item.make))].filter(Boolean);
      setAvailableMakes(uniqueMakes);
    };
      
    fetchMakes();
  }, []);

  useEffect(() => {
    // Fetch available models based on selected make
    const fetchModels = async () => {
      if (!make) {
        setAvailableModels([]);
        return;
      }
        
      const { data, error } = await supabase
        .from('auction_cars')
        .select('model')
        .eq('make', make)
        .order('model', { ascending: true });
        
      if (error) {
        console.error('Error fetching models:', error);
        return;
      }
        
      const uniqueModels = [...new Set(data.map(item => item.model))].filter(Boolean);
      setAvailableModels(uniqueModels);
    };
      
    fetchModels();
  }, [make]);

  const handleApplyFilters = () => {
    const filters: AuctionFiltersType = {};
    
    if (minYear) filters.minYear = parseInt(minYear);
    if (maxYear) filters.maxYear = parseInt(maxYear);
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (make) filters.make = make;
    if (model) filters.model = model;
    
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setMinYear("");
    setMaxYear("");
    setMinPrice("");
    setMaxPrice("");
    setMake("");
    setModel("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minYear">Rok od</Label>
              <Input
                id="minYear"
                placeholder="Od"
                type="number"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxYear">Rok do</Label>
              <Input
                id="maxYear"
                placeholder="Do"
                type="number"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice">Cena od</Label>
              <Input
                id="minPrice"
                placeholder="Od"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Cena do</Label>
              <Input
                id="maxPrice"
                placeholder="Do"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <Label htmlFor="make">Marka</Label>
            <Select
              value={make}
              onValueChange={setMake}
            >
              <SelectTrigger id="make">
                <SelectValue placeholder="Wybierz markę" />
              </SelectTrigger>
              <SelectContent>
                {availableMakes.map((makeName) => (
                  <SelectItem key={makeName} value={makeName}>
                    {makeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="model">Model</Label>
            <Select
              value={model}
              onValueChange={setModel}
              disabled={!make || availableModels.length === 0}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Wybierz model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((modelName) => (
                  <SelectItem key={modelName} value={modelName}>
                    {modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={handleResetFilters}
        >
          Resetuj
        </Button>
        <Button
          onClick={handleApplyFilters}
        >
          Zastosuj filtry
        </Button>
      </div>
    </div>
  );
};
