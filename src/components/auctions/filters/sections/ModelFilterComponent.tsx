
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
        const { data, error } = await supabase
          .from('auction_cars')
          .select('model')
          .eq('make', makeValue)
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
