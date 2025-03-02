
import { supabase } from "@/integrations/supabase/client";

// Function to check database connection before scraping
export const checkDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
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
    
    console.log('Database connection successful', data);
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
      console.log('Invoking scrape-cars edge function...');
      const { data: scrapingData, error } = await supabase.functions.invoke('scrape-cars', {
        method: 'POST',
        body: { source: 'openlane' },
      });
      
      console.log('Edge function response received:', scrapingData);
      
      if (error) {
        console.error('Function error details:', {
          message: error.message,
          name: error.name,
          status: error.status,
        });
        
        // More specific error messages based on status or content
        if (error.message.includes("subprocess")) {
          throw new Error("Помилка конфігурації сервера: виконання процесів не дозволено");
        } else if (error.message.includes("non-2xx")) {
          throw new Error("Сервер повернув неочікуваний статус відповіді. Перевірте логи функції");
        } else {
          throw new Error("Помилка при виконанні функції скрапінгу: " + error.message);
        }
      }
      
      if (!scrapingData) {
        console.error('No data returned from edge function');
        throw new Error("Функція не повернула дані");
      }
      
      // Check if there's an error field in the response even if success is true
      if (scrapingData.error) {
        console.error('Error in response data:', scrapingData.error);
        throw new Error(scrapingData.error || "Помилка при скрапінгу: " + scrapingData.error);
      }
      
      // Check if the scraping was not successful based on the success field
      if (scrapingData.success === false) {
        console.error('Scraping failed:', scrapingData.message);
        throw new Error(scrapingData.message || "Помилка при скрапінгу");
      }
      
      console.log('Scraping completed successfully:', scrapingData);
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
