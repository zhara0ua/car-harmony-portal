
import { supabase } from "@/integrations/supabase/client";

export const triggerScraping = async () => {
  try {
    console.log('Calling scrape-cars function...');
    const { data, error } = await supabase.functions.invoke('scrape-cars', {
      method: 'POST',
    });
    
    if (error) {
      console.error('Function error:', error);
      throw error;
    }
    
    console.log('Function response:', data);
    return data;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
