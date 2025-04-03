
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

interface MakeFilterComponentProps {
  value?: string;
  onChange: (value: string) => void;
}

export const MakeFilterComponent = ({
  value,
  onChange
}: MakeFilterComponentProps) => {
  const [makes, setMakes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error('Failed to fetch makes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMakes();
  }, []);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="make">Marka</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger id="make">
          <SelectValue placeholder="Wybierz markę" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_makes">Wszystkie marki</SelectItem>
          {makes.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
