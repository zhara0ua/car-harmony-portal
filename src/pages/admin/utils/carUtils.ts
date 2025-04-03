
import { supabase } from "@/integrations/supabase/client";
import { Car } from "../types/car";
import { toast } from "@/hooks/use-toast";

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

const uploadImage = async (file: File, folderName: string): Promise<string | null> => {
  try {
    const filename = `${folderName}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Using the 'cars' bucket that we properly set up with RLS policies
    const { data, error } = await supabase.storage
      .from('cars')
      .upload(filename, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('cars')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося завантажити зображення",
      variant: "destructive",
    });
    return null;
  }
};

const uploadMultipleImages = async (files: File[], carId: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, carId));
    const results = await Promise.all(uploadPromises);
    const validUrls = results.filter((url): url is string => url !== null);
    
    if (validUrls.length === 0 && files.length > 0) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити жодне зображення",
        variant: "destructive",
      });
    }
    
    return validUrls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося завантажити зображення",
      variant: "destructive",
    });
    return [];
  }
};

export const createCar = async (formData: FormData, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
  try {
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
    if (error) throw error;

    toast({
      title: "Успішно",
      description: "Автомобіль додано",
    });

    return true;
  } catch (error) {
    console.error('Error adding car:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося додати автомобіль",
      variant: "destructive",
    });
    return false;
  }
};

export const updateCar = async (formData: FormData, carId: number, imageFiles: File[], mainImageIndex: number): Promise<boolean> => {
  try {
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
    
    if (fetchError) throw fetchError;
    
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

    if (error) throw error;

    toast({
      title: "Успішно",
      description: "Дані автомобіля оновлено",
    });

    return true;
  } catch (error) {
    console.error('Error updating car:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося оновити дані автомобіля",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteCar = async (carId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (error) throw error;

    toast({
      title: "Успішно",
      description: "Автомобіль видалено",
    });

    return true;
  } catch (error) {
    console.error('Error deleting car:', error);
    toast({
      title: "Помилка",
      description: "Не вдалося видалити автомобіль",
      variant: "destructive",
    });
    return false;
  }
};
