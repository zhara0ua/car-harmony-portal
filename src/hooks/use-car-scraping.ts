
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCarScraping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startScraping = async () => {
    try {
      console.log('Starting car scraping...');
      const { data, error } = await supabase.functions.invoke('scrape-cars');
      console.log('Scraping response:', data);
      
      if (error) {
        console.error('Scraping error:', error);
        throw error;
      }
      
      if (data?.success) {
        toast({
          title: "Успіх",
          description: data.message,
        });
        await queryClient.invalidateQueries({ queryKey: ['scraped-cars'] });
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Detailed scraping error:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося запустити скрапінг",
        variant: "destructive",
      });
    }
  };

  return { startScraping };
}
