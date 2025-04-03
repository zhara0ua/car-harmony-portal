
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";

export const uploadImage = async (file: File, folderName: string): Promise<string | null> => {
  try {
    const filename = `${folderName}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    console.log(`Uploading image: ${filename} (${file.size} bytes, type: ${file.type})`);
    
    // Upload the file using adminSupabase client to bypass RLS
    const { data, error } = await adminSupabase.storage
      .from('cars')
      .upload(filename, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: urlData } = adminSupabase.storage
      .from('cars')
      .getPublicUrl(filename);

    console.log(`Image uploaded successfully. Public URL: ${urlData.publicUrl}`);
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
    console.log(`Uploading ${files.length} images for car: ${carId}`);
    
    // Added validation for empty files array
    if (files.length === 0) {
      console.log("No files to upload");
      return [];
    }
    
    // Log file details for debugging
    files.forEach((file, index) => {
      console.log(`File ${index+1}: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    });
    
    const uploadPromises = files.map(file => uploadImage(file, carId));
    const results = await Promise.all(uploadPromises);
    const validUrls = results.filter((url): url is string => url !== null);
    
    console.log(`Upload results: ${results.length} total, ${validUrls.length} successful`);
    
    if (validUrls.length === 0 && files.length > 0) {
      console.error("Failed to upload any images");
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити жодне зображення",
        variant: "destructive",
      });
    }
    
    console.log(`Successfully uploaded ${validUrls.length} out of ${files.length} images`);
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
