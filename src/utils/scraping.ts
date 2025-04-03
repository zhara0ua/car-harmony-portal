
import { supabase } from "@/integrations/supabase/client";

export const triggerScraping = async () => {
  try {
    console.log('Starting database connection check...');
    
    // Simple database connection check
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
      // Call the renamed scrape-cars function
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

export const triggerAuctionScraping = async () => {
  try {
    console.log('Starting auction scraping process...');
    
    // Simple database connection check
    const { data, error: healthCheckError } = await supabase
      .from('auction_cars')
      .select('id')
      .limit(1);

    if (healthCheckError) {
      console.error('Database health check failed:', healthCheckError);
      if (healthCheckError.code === 'PGRST301') {
        throw new Error("Error authenticating with database");
      } else if (healthCheckError.code === '57P03') {
        throw new Error("Database not responding. Please try again later");
      } else {
        throw new Error("Database connection error: " + healthCheckError.message);
      }
    }

    console.log('Database connection successful, starting auction scraping...');
    
    try {
      // Call the auction scraper function
      const { data: scrapingData, error } = await supabase.functions.invoke('scrape-auctions', {
        method: 'POST',
        body: {},
      });
      
      if (error) {
        console.error('Function error details:', {
          message: error.message,
          name: error.name,
          status: error.status,
        });
        throw new Error("Error executing auction scraping function: " + error.message);
      }
      
      if (!scrapingData) {
        throw new Error("Function returned no data");
      }
      
      if (!scrapingData.success) {
        console.error('Invalid response from function:', scrapingData);
        throw new Error(scrapingData?.error || "Unexpected response from server");
      }
      
      // Add information about skipped cars if available
      const message = scrapingData.skipped > 0 
        ? `Auction data updated. Added ${scrapingData.count} cars, skipped ${scrapingData.skipped} invalid entries.`
        : `Auction data updated. Added ${scrapingData.count} cars.`;
      
      console.log('Function response:', scrapingData);
      return {
        ...scrapingData,
        message
      };
    } catch (functionError) {
      console.error('Edge function execution error:', functionError);
      throw functionError;
    }
  } catch (error) {
    console.error('Error triggering auction scraping:', error);
    throw error;
  }
};
