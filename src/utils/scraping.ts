
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export const triggerScraping = async () => {
  try {
    console.log('Starting database connection check...');
    
    // Спрощена перевірка з'єднання з базою даних
    const { data, error: healthCheckError } = await supabase
      .from('scraped_cars')
      .select('id')
      .limit(1);

    if (healthCheckError) {
      console.error('Database health check failed:', healthCheckError);
      if (healthCheckError.code === 'PGRST301') {
        throw new Error("Помилка аутентифікації з базою даних");
      } else if (healthCheckError.code === '57P03') {
        throw new Error("База даних не відповідає. Спробуйте пізніше");
      } else {
        throw new Error("Помилка з'єднання з базою даних: " + healthCheckError.message);
      }
    }

    console.log('Database connection successful, starting scraping...');
    
    try {
      const [oldScraper, openlaneResponse] = await Promise.all([
        supabase.functions.invoke('scrape-cars', {
          method: 'POST',
          body: {},
        }),
        supabase.functions.invoke('scrape-openlane', {
          method: 'POST',
          body: {},
        })
      ]);
      
      if (!oldScraper.data?.success && !openlaneResponse.data?.success) {
        throw new Error("Обидва скрапери завершились з помилкою");
      }
      
      return {
        success: true,
        message: "Скрапінг успішно завершено",
        data: {
          oldScraper: oldScraper.data,
          openlane: openlaneResponse.data
        }
      };
      
    } catch (functionError) {
      console.error('Edge function execution error:', functionError);
      throw functionError;
    }
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
