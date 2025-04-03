
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const uploadImage = async (file: File, folderName: string): Promise<string | null> => {
  try {
    const filename = `${folderName}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Make sure the cars bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const carsBucketExists = buckets?.some(bucket => bucket.name === 'cars');
    
    if (!carsBucketExists) {
      // Create the bucket if it doesn't exist
      console.log("Creating 'cars' bucket");
      const { error: createBucketError } = await supabase.storage.createBucket('cars', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        throw createBucketError;
      }
    }
    
    // Upload the file
    console.log(`Uploading image: ${filename}`);
    const { data, error } = await supabase.storage
      .from('cars')
      .upload(filename, file, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
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
