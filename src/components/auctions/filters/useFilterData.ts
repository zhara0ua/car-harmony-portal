
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFilterData = () => {
  const [makes, setMakes] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoading(true);
      try {
        // Fetch makes
        const { data: makesData, error: makesError } = await supabase
          .from('auction_cars')
          .select('make')
          .not('make', 'is', null);
        
        if (makesError) {
          throw makesError;
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
          throw fuelError;
        }
        
        // Extract unique fuel types
        const uniqueFuelTypes = Array.from(
          new Set(fuelData.map(item => item.fuel_type).filter(Boolean))
        ).sort() as string[];
        
        setFuelTypes(uniqueFuelTypes);

        // Fetch transmissions
        const { data: transmissionData, error: transmissionError } = await supabase
          .from('auction_cars')
          .select('transmission')
          .not('transmission', 'is', null);
        
        if (transmissionError) {
          throw transmissionError;
        }
        
        // Extract unique transmissions
        const uniqueTransmissions = Array.from(
          new Set(transmissionData.map(item => item.transmission).filter(Boolean))
        ).sort() as string[];
        
        setTransmissions(uniqueTransmissions);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError(err instanceof Error ? err.message : 'Unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);
  
  return { makes, fuelTypes, transmissions, isLoading, error };
};
