
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelFilterComponentProps {
  makeValue?: string;
  modelValue?: string;
  onChange: (value: string) => void;
}

export const ModelFilterComponent = ({
  makeValue,
  modelValue,
  onChange
}: ModelFilterComponentProps) => {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load models when make changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!makeValue || makeValue === "all_makes") {
        setModels([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch all models for specific make using pagination
        const fetchAllModels = async () => {
          const PAGE_SIZE = 1000; // Supabase's max rows per request
          let allModels = new Set<string>();
          let page = 0;
          let hasMore = true;
          
          while (hasMore) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            
            console.log(`Fetching models for ${makeValue}, page ${page + 1}, rows ${from} to ${to}`);
            
            const { data, error, count } = await supabase
              .from('auction_cars')
              .select('model', { count: 'exact' })
              .eq('make', makeValue)
              .not('model', 'is', null)
              .range(from, to);
            
            if (error) {
              console.error('Error fetching models:', error);
              break;
            }
            
            if (data.length === 0) {
              hasMore = false;
            } else {
              // Add models to set to ensure uniqueness
              data.forEach(item => {
                if (item.model) allModels.add(item.model);
              });
              
              page++;
              
              // Check if we should continue fetching
              hasMore = count !== null && from + data.length < count;
              console.log(`Fetched ${allModels.size} unique models from ${from + data.length} of ${count} total cars`);
            }
          }
          
          return Array.from(allModels).sort();
        };
        
        const uniqueModels = await fetchAllModels();
        setModels(uniqueModels);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, [makeValue]);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="model">Model</Label>
      <Select
        value={modelValue}
        onValueChange={onChange}
        disabled={!makeValue || makeValue === "all_makes" || isLoading}
      >
        <SelectTrigger id="model">
          <SelectValue placeholder="Wybierz model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_models">Wszystkie modele</SelectItem>
          {models.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
