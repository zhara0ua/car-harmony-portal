
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCarScraping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startScraping = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-cars');
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Успіх",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['scraped-cars'] });
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося запустити скрапінг",
        variant: "destructive",
      });
      console.error('Scraping error:', error);
    }
  };

  return { startScraping };
}
