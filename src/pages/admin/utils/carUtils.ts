
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

const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('cars')
      .upload(filename, file);

    if (error) throw error;

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

export const createCar = async (formData: FormData, imageFile: File | null): Promise<boolean> => {
  try {
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceNumber = parseInt(formData.get('price') as string);
    const mileage = `${formData.get('mileage')}`;
    
    // Handle image upload or use provided URL
    let imageUrl = formData.get('image') as string;
    
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    if (!imageUrl) {
      toast({
        title: "Увага",
        description: "Необхідно вказати URL зображення або завантажити файл",
        variant: "destructive",
      });
      return false;
    }

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
      image: imageUrl,
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

export const updateCar = async (formData: FormData, carId: number, imageFile: File | null): Promise<boolean> => {
  try {
    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceNumber = parseInt(formData.get('price') as string);
    const mileage = `${formData.get('mileage')}`;
    
    // Handle image upload or use provided URL
    let imageUrl = formData.get('image') as string;
    
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

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
      image: imageUrl,
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
