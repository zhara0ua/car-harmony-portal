
import { supabase } from "@/integrations/supabase/client";

export const triggerScraping = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-cars');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
