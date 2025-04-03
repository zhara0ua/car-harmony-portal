
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";
import { uploadMultipleImages } from "./imageUtils";

export const createCar = async (formData: FormData, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
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
    
    console.log("Form data received for car creation:", { make, model, priceString });
    
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
    
    // Get mileage
    const mileage = `${formData.get('mileage')}`;
    
    // Generate a unique folder name for car images
    const folderName = `car_${Date.now()}`;
    
    // Upload all image files
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      console.log("Uploading car images:", imageFiles.map(f => f.name));
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

    // Collect additional image URLs from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_url_') && typeof value === 'string' && value.startsWith('http')) {
        imageUrls.push(value);
      }
    }

    // Add an extra stock image
    const extraImage = "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
    imageUrls.push(extraImage);

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

    // Prepare car data
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

    console.log("Creating new car:", newCar);

    // Insert car into database
    const { data, error } = await adminSupabase
      .from('cars')
      .insert(newCar)
      .select()
      .single();
    
    if (error) {
      console.error('Database error when creating car:', error);
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
    const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
    console.error('Error adding car:', error);
    toast({
      title: "Помилка",
      description: `Не вдалося додати автомобіль: ${errorMessage}`,
      variant: "destructive",
    });
    return false;
  }
};
