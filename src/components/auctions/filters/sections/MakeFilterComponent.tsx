
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
        // Fetch all makes using pagination to get all results
        const fetchAllMakes = async () => {
          const PAGE_SIZE = 1000; // Supabase's max rows per request
          let allMakes = new Set<string>();
          let page = 0;
          let hasMore = true;
          
          while (hasMore) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            
            console.log(`Fetching makes page ${page + 1}, rows ${from} to ${to}`);
            
            const { data, error, count } = await supabase
              .from('auction_cars')
              .select('make', { count: 'exact' })
              .not('make', 'is', null)
              .range(from, to);
            
            if (error) {
              console.error('Error fetching makes:', error);
              break;
            }
            
            if (data.length === 0) {
              hasMore = false;
            } else {
              // Add makes to set to ensure uniqueness
              data.forEach(item => {
                if (item.make) allMakes.add(item.make);
              });
              
              page++;
              
              // Check if we should continue fetching
              hasMore = count !== null && from + data.length < count;
              console.log(`Fetched ${allMakes.size} unique makes from ${from + data.length} of ${count} total cars`);
            }
          }
          
          return Array.from(allMakes).sort();
        };
        
        const uniqueMakes = await fetchAllMakes();
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
