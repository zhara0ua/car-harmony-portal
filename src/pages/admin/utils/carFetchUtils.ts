
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
      // For cars that don't have an images array, add the default image
      const processedData = data.map(car => {
        if (!car.images || car.images.length === 0) {
          // Add the main image to the images array
          car.images = [car.image];
          
          // Add an extra stock image
          const extraImage = "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
          car.images.push(extraImage);
        }
        return car;
      });
      
      console.log(`Sample car data:`, processedData[0]);
      return processedData;
    }
    
    return data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
    console.error('Error fetching cars:', error);
    toast({
      title: "Помилка",
      description: `Не вдалося завантажити список автомобілів: ${errorMessage}`,
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
    
    // If car doesn't have an images array, add the default image
    if (data && (!data.images || data.images.length === 0)) {
      data.images = [data.image];
      
      // Add an extra stock image
      const extraImage = "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
      data.images.push(extraImage);
    }
    
    return data as Car;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
    console.error(`Error fetching car with ID ${id}:`, error);
    toast({
      title: "Помилка",
      description: `Не вдалося завантажити дані автомобіля: ${errorMessage}`,
      variant: "destructive",
    });
    return null;
  }
};
