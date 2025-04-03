
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

interface TransmissionFilterComponentProps {
  value?: string;
  onChange: (value: string) => void;
}

export const TransmissionFilterComponent = ({
  value,
  onChange
}: TransmissionFilterComponentProps) => {
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load transmissions on component mount
  useEffect(() => {
    const fetchTransmissions = async () => {
      setIsLoading(true);
      try {
        // Fetch all transmissions using pagination to get all results
        const fetchAllTransmissions = async () => {
          const PAGE_SIZE = 1000; // Supabase's max rows per request
          let allTransmissions = new Set<string>();
          let page = 0;
          let hasMore = true;
          
          while (hasMore) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            
            console.log(`Fetching transmissions page ${page + 1}, rows ${from} to ${to}`);
            
            const { data, error, count } = await supabase
              .from('auction_cars')
              .select('transmission', { count: 'exact' })
              .not('transmission', 'is', null)
              .range(from, to);
            
            if (error) {
              console.error('Error fetching transmissions:', error);
              break;
            }
            
            if (data.length === 0) {
              hasMore = false;
            } else {
              // Add transmissions to set to ensure uniqueness
              data.forEach(item => {
                if (item.transmission) allTransmissions.add(item.transmission);
              });
              
              page++;
              
              // Check if we should continue fetching
              hasMore = count !== null && from + data.length < count;
              console.log(`Fetched ${allTransmissions.size} unique transmissions from ${from + data.length} of ${count} total cars`);
            }
          }
          
          return Array.from(allTransmissions).sort();
        };
        
        const uniqueTransmissions = await fetchAllTransmissions();
        setTransmissions(uniqueTransmissions);
      } catch (error) {
        console.error('Failed to fetch transmissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransmissions();
  }, []);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="transmission">Skrzynia biegów</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger id="transmission">
          <SelectValue placeholder="Wybierz typ skrzyni" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_transmissions">Wszystkie typy</SelectItem>
          {transmissions.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
