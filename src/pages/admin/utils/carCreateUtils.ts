
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";
import { uploadMultipleImages } from "./imageUtils";

export const createCar = async (formData: FormData, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
  try {
    // Check admin authentication status from localStorage
    const isAdminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!isAdminAuthenticated) {
      toast({
        title: "Помилка авторизації",
        description: "Ви не авторизовані. Будь ласка, увійдіть у систему.",
        variant: "destructive",
      });
      return false;
    }
    
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceString = formData.get('price') as string;
    const priceNumber = parseInt(priceString);
    
    if (isNaN(priceNumber)) {
      toast({
        title: "Помилка",
        description: "Некоректне значення ціни",
        variant: "destructive",
      });
      return false;
    }
    
    const mileage = `${formData.get('mileage')}`;
    
    // Generate a unique ID for the car folder
    const folderName = `car_${Date.now()}`;
    
    // Upload all image files
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      imageUrls = await uploadMultipleImages(imageFiles, folderName);
    }

    // Collect image URLs from form data (added as hidden inputs)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_url_') && typeof value === 'string' && value.startsWith('http')) {
        imageUrls.push(value);
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

    // Verify mainImageIndex is within bounds
    const validMainIndex = Math.min(mainImageIndex, imageUrls.length - 1);
    
    // Set the main image (for backward compatibility)
    const mainImage = imageUrls[validMainIndex] || imageUrls[0];

    const newCar = {
      name: `${make} ${model}`,
      make,
      model,
      price: `${priceNumber.toLocaleString()} zł`,
      price_number: priceNumber,
      year: parseInt(formData.get('year') as string) || new Date().getFullYear(),
      mileage,
      category: formData.get('category') as string,
      transmission: formData.get('transmission') as string,
      fuel_type: formData.get('fuel_type') as string,
      engine_size: formData.get('engine_size') as string,
      engine_power: formData.get('engine_power') as string,
      image: mainImage,
      images: imageUrls,
    };

    console.log("Creating new car:", newCar);

    // Use the regular supabase client for anonymous operations
    const { data, error } = await supabase.from('cars').insert(newCar).select();
    
    if (error) {
      console.error('Database error:', error);
      toast({
        title: "Помилка бази даних",
        description: `${error.message}`,
        variant: "destructive",
      });
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
