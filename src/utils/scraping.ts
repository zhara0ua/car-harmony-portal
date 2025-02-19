
import { supabase } from "@/integrations/supabase/client";

export const triggerScraping = async () => {
  try {
    console.log('Calling scrape-cars function...');
    
    // Перевіряємо з'єднання з Supabase
    const { error: healthCheckError } = await supabase
      .from('scraped_cars')
      .select('count(*)', { count: 'exact' })
      .limit(0);

    if (healthCheckError) {
      console.error('Database connection error:', healthCheckError);
      throw new Error("Помилка з'єднання з базою даних");
    }

    // Викликаємо функцію скрапінгу
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
