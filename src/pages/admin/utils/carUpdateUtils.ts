
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";
import { uploadMultipleImages } from "./imageUtils";

export const updateCar = async (formData: FormData, carId: number, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
  try {
    // Check admin authentication status
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
    
    // Extract form data
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceString = formData.get('price') as string;
    
    console.log("Updating car:", { carId, make, model, priceString });
    
    // Validate required fields
    if (!make || !model || !priceString) {
      console.error("Missing required fields:", { make, model, priceString });
      toast({
        title: "Помилка",
        description: "Всі обов'язкові поля повинні бути заповнені",
        variant: "destructive",
      });
      return false;
    }

    // Parse and validate price
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
    
    // Fetch current car to get existing images
    const { data: currentCar, error: fetchError } = await adminSupabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching car data for update:', fetchError);
      throw fetchError;
    }
    
    // Create a folder name based on car ID
    const folderName = `car_${carId}`;
    
    // Collect all image sources
    let allImageUrls: string[] = [];
    
    // If there are new files to upload, upload them
    if (imageFiles.length > 0) {
      console.log(`Uploading ${imageFiles.length} new images for car ${carId}`);
      const uploadedImageUrls = await uploadMultipleImages(imageFiles, folderName);
      allImageUrls = [...allImageUrls, ...uploadedImageUrls];
    }
    
    // Collect URL images from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_url_') && typeof value === 'string' && value.startsWith('http')) {
        allImageUrls.push(value);
      }
    }
    
    // Use existing images if no new images
    if (allImageUrls.length === 0) {
      allImageUrls = currentCar.images || [];
      
      // If no images array but has image property, initialize with it
      if (!allImageUrls.length && currentCar.image) {
        allImageUrls = [currentCar.image];
      }
    }
    
    // Add an extra stock image if it doesn't exist already
    const extraImage = "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
    if (!allImageUrls.includes(extraImage)) {
      allImageUrls.push(extraImage);
    }
    
    // Make sure we have at least one image
    if (allImageUrls.length === 0) {
      console.error("No images available for the car");
      toast({
        title: "Увага",
        description: "Необхідно мати хоча б одне зображення",
        variant: "destructive",
      });
      return false;
    }
    
    // Verify mainImageIndex is within bounds
    const validMainIndex = Math.min(mainImageIndex, allImageUrls.length - 1);
    
    // Set the main image (for backward compatibility)
    const mainImage = allImageUrls[validMainIndex] || allImageUrls[0];

    // Prepare update data
    const updatedCar = {
      name: `${make} ${model}`,
      make,
      model,
      price: `${priceNumber.toLocaleString()} zł`,
      price_number: priceNumber,
      year: parseInt(formData.get('year') as string) || currentCar.year,
      mileage: mileage ? `${mileage} km` : "",
      category: formData.get('category') as string || currentCar.category,
      transmission: formData.get('transmission') as string || currentCar.transmission,
      fuel_type: formData.get('fuel_type') as string || currentCar.fuel_type,
      engine_size: formData.get('engine_size') as string || currentCar.engine_size,
      engine_power: formData.get('engine_power') as string || currentCar.engine_power,
      image: mainImage,
      images: allImageUrls,
    };

    console.log("Updating car data:", { carId, updatedCar });

    // Update car in database
    const { error } = await adminSupabase
      .from('cars')
      .update(updatedCar)
      .eq('id', carId);

    if (error) {
      console.error('Database error when updating car:', error);
      toast({
        title: "Помилка бази даних",
        description: `${error.message}`,
        variant: "destructive",
      });
      return false;
    }

    console.log("Car updated successfully");
    toast({
      title: "Успішно",
      description: "Дані автомобіля оновлено",
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
    console.error('Error updating car:', error);
    toast({
      title: "Помилка",
      description: `Не вдалося оновити дані автомобіля: ${errorMessage}`,
      variant: "destructive",
    });
    return false;
  }
};
