
import { supabase } from "@/integrations/supabase/client";

// Function to prompt user to set up Firecrawl API key if not found
export const checkFirecrawlApiKey = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-secrets', {
      method: 'POST',
      body: { secretName: 'FIRECRAWL_API_KEY' },
    });
    
    if (error || !data?.exists) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking for FIRECRAWL_API_KEY:', error);
    return false;
  }
};

export const triggerScraping = async () => {
  try {
    console.log('Starting database connection check...');
    
    // Simplified database connection check
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

    // Check if Firecrawl API key is set
    const hasFirecrawlApiKey = await checkFirecrawlApiKey();
    if (!hasFirecrawlApiKey) {
      throw new Error("Відсутній API ключ. Будь ласка, налаштуйте API ключ Firecrawl.");
    }

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
