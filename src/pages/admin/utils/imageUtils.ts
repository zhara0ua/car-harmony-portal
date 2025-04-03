
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";

export const uploadImage = async (file: File, folderName: string): Promise<string | null> => {
  try {
    const filename = `${folderName}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Using the admin client for storage operations with explicit content-type
    const { data, error } = await adminSupabase.storage
      .from('cars')
      .upload(filename, file, {
        contentType: file.type, // Explicitly set the content type
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: urlData } = adminSupabase.storage
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

export const uploadMultipleImages = async (files: File[], carId: string): Promise<string[]> => {
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
