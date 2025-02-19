
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useCarScraping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startScraping = async () => {
    try {
      const response = await fetch(
        'https://btkfrowwhgcnzgncjjny.supabase.co/functions/v1/scrape-cars',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Успіх",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['scraped-cars'] });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося запустити скрапінг",
        variant: "destructive",
      });
    }
  };

  return { startScraping };
}
