
import { adminSupabase } from "@/integrations/supabase/adminClient";

export const uploadMultipleImages = async (imageFiles: File[], folderName: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  try {
    console.log(`Attempting to upload ${imageFiles.length} images to folder '${folderName}'`);
    
    // Create a bucket if it doesn't exist
    const bucketName = 'cars';
    
    for (const file of imageFiles) {
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
      }
    }
    
    console.log(`Successfully uploaded ${uploadedUrls.length} out of ${imageFiles.length} images`);
    return uploadedUrls;
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    return uploadedUrls;
  }
};
