
import { supabase } from "@/integrations/supabase/client";

// Function to check database connection before scraping
export const checkDatabaseConnection = async () => {
  try {
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
    
    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    throw error;
  }
};

export const triggerScraping = async () => {
  try {
    console.log('Starting database connection check...');
    
    // Check database connection
    await checkDatabaseConnection();
    
    console.log('Database connection successful, starting scraping...');
    
    try {
      const { data: scrapingData, error } = await supabase.functions.invoke('scrape-cars', {
        method: 'POST',
        body: { source: 'openlane' },
      });
      
      if (error) {
        console.error('Function error details:', {
          message: error.message,
          name: error.name,
          status: error.status,
        });
        throw new Error("Помилка при виконанні функції скрапінгу: " + error.message);
      }
      
      if (!scrapingData) {
        throw new Error("Функція не повернула дані");
      }
      
      if (!scrapingData.success) {
        console.error('Invalid response from function:', scrapingData);
        throw new Error(scrapingData?.error || "Неочікувана відповідь від сервера");
      }
      
      console.log('Function response:', scrapingData);
      return scrapingData;
    } catch (functionError) {
      console.error('Edge function execution error:', functionError);
      throw functionError;
    }
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
