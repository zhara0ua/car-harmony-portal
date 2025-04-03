
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Car } from "../types/car";
import { uploadMultipleImages } from "./imageUtils";

export const fetchCars = async () => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedCars = data?.map(car => ({
      ...car,
      price: `${car.price_number.toLocaleString()} zł`,
      mileage: `${car.mileage} km.`
    })) || [];

    return formattedCars;
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

export const createCar = async (formData: FormData, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
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
    
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceNumber = parseInt(formData.get('price') as string);
    const mileage = `${formData.get('mileage')}`;
    
    // Generate a unique ID for the car folder
    const folderName = `car_${Date.now()}`;
    
    // Upload all images
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      imageUrls = await uploadMultipleImages(imageFiles, folderName);
      if (imageUrls.length === 0) {
        return false;
      }
    }

    // Make sure we have at least one image
    if (imageUrls.length === 0) {
      toast({
        title: "Увага",
        description: "Необхідно завантажити хоча б одне зображення",
        variant: "destructive",
      });
      return false;
    }

    // Set the main image (for backward compatibility)
    const mainImage = imageUrls[mainImageIndex] || imageUrls[0];

    const newCar = {
      name: `${make} ${model}`,
      make,
      model,
      price: `${priceNumber.toLocaleString()} zł`,
      price_number: priceNumber,
      year: parseInt(formData.get('year') as string),
      mileage,
      category: formData.get('category') as string,
      transmission: formData.get('transmission') as string,
      fuel_type: formData.get('fuel_type') as string,
      engine_size: formData.get('engine_size') as string,
      engine_power: formData.get('engine_power') as string,
      image: mainImage,
      images: imageUrls,
    };

    const { error } = await supabase.from('cars').insert(newCar);
    if (error) {
      console.error('Database error:', error);
      if (error.message.includes('row-level security')) {
        toast({
          title: "Помилка безпеки",
          description: "Немає прав для додавання автомобіля. Будь ласка, перевірте, чи ви авторизовані.",
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
      description: "Автомобіль додано",
    });

    return true;
  } catch (error) {
    console.error('Error adding car:', error);
    toast({
      title: "Помилка",
      description: error instanceof Error ? error.message : "Не вдалося додати автомобіль",
      variant: "destructive",
    });
    return false;
  }
};

export const updateCar = async (formData: FormData, carId: number, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
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
    
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceNumber = parseInt(formData.get('price') as string);
    const mileage = `${formData.get('mileage')}`;
    
    // Get current car data to access existing images
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching car data:', fetchError);
      throw fetchError;
    }
    
    // Create a folder name based on car ID
    const folderName = `car_${carId}`;
    
    // Combine existing images with new ones
    let allImageUrls: string[] = currentCar.images || [];
    
    // If no images array but has image property, initialize with it
    if (!allImageUrls.length && currentCar.image) {
      allImageUrls = [currentCar.image];
    }
    
    // Upload new images if any
    if (imageFiles.length > 0) {
      const newImageUrls = await uploadMultipleImages(imageFiles, folderName);
      allImageUrls = [...allImageUrls, ...newImageUrls];
    }
    
    // Make sure we have at least one image
    if (allImageUrls.length === 0) {
      toast({
        title: "Увага",
        description: "Необхідно мати хоча б одне зображення",
        variant: "destructive",
      });
      return false;
    }
    
    // Set the main image (for backward compatibility)
    const mainImage = allImageUrls[mainImageIndex] || allImageUrls[0];

    const updatedCar = {
      name: `${make} ${model}`,
      make,
      model,
      price: `${priceNumber.toLocaleString()} zł`,
      price_number: priceNumber,
      year: parseInt(formData.get('year') as string),
      mileage,
      category: formData.get('category') as string,
      transmission: formData.get('transmission') as string,
      fuel_type: formData.get('fuel_type') as string,
      engine_size: formData.get('engine_size') as string,
      engine_power: formData.get('engine_power') as string,
      image: mainImage,
      images: allImageUrls,
    };

    const { error } = await supabase
      .from('cars')
      .update(updatedCar)
      .eq('id', carId);

    if (error) {
      console.error('Database error:', error);
      if (error.message.includes('row-level security')) {
        toast({
          title: "Помилка безпеки",
          description: "Немає прав для оновлення автомобіля. Будь ласка, перевірте, чи ви авторизовані.",
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
      description: "Дані автомобіля оновлено",
    });

    return true;
  } catch (error) {
    console.error('Error updating car:', error);
    toast({
      title: "Помилка",
      description: error instanceof Error ? error.message : "Не вдалося оновити дані автомобіля",
      variant: "destructive",
    });
    return false;
  }
};

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
