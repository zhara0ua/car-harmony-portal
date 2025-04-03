
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const deleteCar = async (carId: number): Promise<boolean> => {
  try {
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Помилка авторизації",
        description: "Ви не авторизовані. Будь ласка, увійдіть у систему.",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (error) {
      console.error('Database error:', error);
      if (error.message.includes('row-level security')) {
        toast({
          title: "Помилка безпеки",
          description: "Немає прав для видалення автомобіля. Будь ласка, перевірте, чи ви авторизовані.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Помилка бази даних",
          description: `${error.message}`,
          variant: "destructive",
        });
      }
      return false;
    }

    toast({
      title: "Успішно",
      description: "Автомобіль видалено",
    });

    return true;
  } catch (error) {
    console.error('Error deleting car:', error);
    toast({
      title: "Помилка",
      description: error instanceof Error ? error.message : "Не вдалося видалити автомобіль",
      variant: "destructive",
    });
    return false;
  }
};
