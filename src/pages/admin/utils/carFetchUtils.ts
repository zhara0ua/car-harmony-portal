
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Car } from "../types/car";
import { toast } from "@/hooks/use-toast";

export const fetchCars = async (): Promise<Car[]> => {
  try {
    // Check admin authentication status from localStorage
    const isAdminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    console.log("Admin authentication status when fetching cars:", isAdminAuthenticated);
    
    if (!isAdminAuthenticated) {
      toast({
        title: "Помилка авторизації",
        description: "Ви не авторизовані для перегляду автомобілів",
        variant: "destructive",
      });
      return [];
    }
    
    console.log("Fetching cars...");
    
    const { data, error } = await adminSupabase
      .from('cars')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching cars:', error);
      throw error;
    }
    
    console.log(`Fetched cars count: ${data?.length}`);
    
    if (data && data.length > 0) {
      console.log(`Sample car data:`, data[0]);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching cars:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося завантажити список автомобілів",
      variant: "destructive",
    });
    return [];
  }
};

export const fetchCarById = async (id: number): Promise<Car | null> => {
  try {
    const { data, error } = await adminSupabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching car with ID ${id}:`, error);
      return null;
    }
    
    return data as Car;
  } catch (error) {
    console.error(`Error fetching car with ID ${id}:`, error);
    return null;
  }
};
