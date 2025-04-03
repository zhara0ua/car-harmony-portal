
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";

export const deleteCar = async (carId: number): Promise<boolean> => {
  try {
    // Check admin authentication status from localStorage
    const isAdminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    console.log("Admin authentication status when deleting car:", isAdminAuthenticated);
    
    if (!isAdminAuthenticated) {
      console.error("Authentication check failed when deleting car - user not authenticated");
      toast({
        title: "Помилка авторизації",
        description: "Ви не авторизовані. Будь ласка, увійдіть у систему.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Deleting car with ID:", carId);
    
    // Use the adminSupabase client for database operations
    const { error } = await adminSupabase
      .from('cars')
      .delete()
      .eq('id', carId);
    
    if (error) {
      console.error('Database error when deleting car:', error);
      toast({
        title: "Помилка бази даних",
        description: `${error.message}`,
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Car deleted successfully:", carId);
    
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
