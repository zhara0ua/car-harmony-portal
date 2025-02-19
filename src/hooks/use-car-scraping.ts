
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCarScraping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startScraping = async () => {
    try {
      console.log('Starting car scraping...');
      
      // Перевіряємо URL функції
      console.log('Function URL:', `${supabase.functions.url}/scrape-cars`);
      
      const { data, error } = await supabase.functions.invoke('scrape-cars', {
        method: 'POST'
      });
      
      console.log('Raw scraping response:', { data, error });
      
      if (error) {
        console.error('Scraping error details:', {
          message: error.message,
          name: error.name,
          cause: error.cause,
          stack: error.stack
        });
        throw error;
      }
      
      if (data?.success) {
        console.log('Scraping successful:', data);
        toast({
          title: "Успіх",
          description: data.message,
          duration: 5000
        });
        await queryClient.invalidateQueries({ queryKey: ['scraped-cars'] });
      } else {
        console.error('Scraping failed:', data);
        throw new Error(data?.error || 'Unknown error occurred during scraping');
      }
    } catch (error) {
      console.error('Full scraping error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "Помилка",
        description: error instanceof Error ? error.message : "Не вдалося запустити скрапінг",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return { startScraping };
}
