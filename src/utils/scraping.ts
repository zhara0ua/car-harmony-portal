
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
    
    const { data: scrapingData, error } = await supabase.functions.invoke('scrape-cars', {
      method: 'POST',
      body: {},
    });
    
    if (error) {
      console.error('Function error details:', {
        message: error.message,
        name: error.name,
        status: error.status,
      });
      throw new Error("Помилка при виконанні функції скрапінгу");
    }
    
    if (!scrapingData || !scrapingData.success) {
      console.error('Invalid response from function:', scrapingData);
      throw new Error(scrapingData?.error || "Неочікувана відповідь від сервера");
    }
    
    console.log('Function response:', scrapingData);
    return scrapingData;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
