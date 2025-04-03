
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { toast } from "@/hooks/use-toast";

export const uploadMultipleImages = async (imageFiles: File[], folderName: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  const bucketName = 'cars';
  
  if (imageFiles.length === 0) {
    return uploadedUrls;
  }
  
  try {
    console.log(`Attempting to upload ${imageFiles.length} images to folder '${folderName}'`);
    
    // Process each file sequentially
    for (const file of imageFiles) {
      // Check file size (max 5MB)
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (file.size > maxSizeBytes) {
        console.error(`File too large: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        toast({
          title: "Помилка",
          description: `Файл занадто великий: ${file.name} (максимум ${maxSizeMB}MB)`,
          variant: "destructive",
        });
        continue;
      }
      
      // Generate a unique file path
      const filePath = `${folderName}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      console.log(`Uploading file: ${filePath}`);
      
      // Upload the file
      const { data, error } = await adminSupabase
        .storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading file ${filePath}:`, error);
        toast({
          title: "Помилка завантаження",
          description: `Не вдалося завантажити ${file.name}: ${error.message}`,
          variant: "destructive",
        });
        continue;
      }
      
      console.log(`File uploaded successfully: ${filePath}`);
      
      // Get the public URL
      const { data: urlData } = adminSupabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (urlData && urlData.publicUrl) {
        console.log(`Public URL generated: ${urlData.publicUrl}`);
        uploadedUrls.push(urlData.publicUrl);
      } else {
        console.error('Failed to get public URL for:', filePath);
        toast({
          title: "Помилка",
          description: `Не вдалося отримати публічне посилання для ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    console.log(`Successfully uploaded ${uploadedUrls.length} out of ${imageFiles.length} images`);
    return uploadedUrls;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Невідома помилка";
    console.error('Error in uploadMultipleImages:', error);
    toast({
      title: "Помилка завантаження",
      description: `Не вдалося завантажити зображення: ${errorMessage}`,
      variant: "destructive",
    });
    return uploadedUrls;
  }
};
