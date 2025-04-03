
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { uploadMultipleImages } from "./imageUtils";

export const createCar = async (formData: FormData, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
  try {
    // Check admin authentication status from localStorage
    const isAdminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!isAdminAuthenticated) {
      console.error("Authentication check failed - user not authenticated");
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
    
    console.log("Form data received:", { make, model, priceString });
    
    if (!make || !model || !priceString) {
      console.error("Missing required fields:", { make, model, priceString });
      toast({
        title: "Помилка",
        description: "Всі обов'язкові поля повинні бути заповнені",
        variant: "destructive",
      });
      return false;
    }

    const priceNumber = parseInt(priceString.replace(/\s+/g, '').replace(',', '.'));
    
    if (isNaN(priceNumber)) {
      console.error("Invalid price value:", priceString);
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
      console.log("Uploading images:", imageFiles.map(f => f.name));
      imageUrls = await uploadMultipleImages(imageFiles, folderName);
      
      if (imageUrls.length === 0) {
        console.error("Failed to upload any images");
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити зображення",
          variant: "destructive",
        });
        return false;
      }
    }

    // Collect image URLs from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_url_') && typeof value === 'string' && value.startsWith('http')) {
        imageUrls.push(value);
      }
    }

    // Make sure we have at least one image
    if (imageUrls.length === 0) {
      console.error("No images provided");
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
      mileage: mileage ? `${mileage} km` : "",
      category: formData.get('category') as string || "Седан",
      transmission: formData.get('transmission') as string || "Автомат",
      fuel_type: formData.get('fuel_type') as string || "Бензин",
      engine_size: formData.get('engine_size') as string || "",
      engine_power: formData.get('engine_power') as string || "",
      image: mainImage,
      images: imageUrls,
    };

    console.log("Attempting to create new car:", newCar);

    const { data, error } = await supabase
      .from('cars')
      .insert(newCar)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      toast({
        title: "Помилка бази даних",
        description: `${error.message}`,
        variant: "destructive",
      });
      return false;
    }

    console.log("Car created successfully:", data);
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
