
import { supabase } from "@/integrations/supabase/client";

export const triggerScraping = async () => {
  try {
    console.log('Starting database connection check...');
    
    // Розширена перевірка з'єднання з базою даних
    const healthCheck = await Promise.race([
      supabase
        .from('scraped_cars')
        .select('count(*)', { count: 'exact' })
        .limit(0),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: Database connection took too long")), 5000)
      )
    ]);

    if ('error' in healthCheck) {
      console.error('Database health check failed:', healthCheck.error);
      if (healthCheck.error.code === 'PGRST301') {
        throw new Error("Помилка аутентифікації з базою даних");
      } else if (healthCheck.error.code === '57P03') {
        throw new Error("База даних не відповідає. Спробуйте пізніше");
      } else {
        throw new Error("Помилка з'єднання з базою даних: " + healthCheck.error.message);
      }
    }

    console.log('Database connection successful, starting scraping...');
    
    const { data, error } = await supabase.functions.invoke('scrape-cars', {
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
    
    if (!data || !data.success) {
      console.error('Invalid response from function:', data);
      throw new Error(data?.error || "Неочікувана відповідь від сервера");
    }
    
    console.log('Function response:', data);
    return data;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
