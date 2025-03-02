
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

// Function to invoke the edge function and handle its response
export const invokeScrapingFunction = async () => {
  // Always use real data by forcing it to true
  const requestOptions = { forceRealData: true };
  
  console.log('Invoking scrape-cars edge function with options:', requestOptions);
  
  try {
    const { data, error } = await supabase.functions.invoke('scrape-cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestOptions),
    });
    
    console.log('Edge function response received:', data);
    
    if (error) {
      console.error('Function error details:', {
        message: error.message,
        name: error.name,
        status: error.status,
      });
      
      // Handle specific error cases
      if (error.message.includes("fetch")) {
        throw new Error("Помилка доступу до сайту CarOutlet. Перевірте з'єднання з інтернетом або доступність сайту.");
      } else if (error.message.includes("non-2xx")) {
        throw new Error("Сервер повернув неочікуваний статус відповіді. Перевірте логи функції");
      } else if (error.message.includes("JSON")) {
        throw new Error("Помилка парсингу відповіді від сервера. Перевірте логи функції");
      } else {
        throw new Error("Помилка при виконанні функції скрапінгу: " + error.message);
      }
    }
    
    // Additional check for empty or invalid data
    if (!data) {
      throw new Error("Функція повернула порожню відповідь");
    }
    
    return data;
  } catch (error) {
    console.error('Error invoking edge function:', error);
    throw error;
  }
};

// Function to validate the function response data
export const validateScrapingResults = (scrapingData: any) => {
  if (!scrapingData) {
    console.error('No data returned from edge function');
    throw new Error("Функція не повернула дані");
  }
  
  // Check if there's an error field in the response even if success is true
  if (scrapingData.error) {
    console.error('Error in response data:', scrapingData.error);
    throw new Error(scrapingData.error || "Помилка при скрапінгу: " + scrapingData.error);
  }
  
  // If the function returns a message about using mock/fallback data
  if (scrapingData.message && 
     (scrapingData.message.includes("mock data") || 
      scrapingData.message.includes("fallback data"))) {
    console.log('Using mock/fallback data:', scrapingData.message);
    // Still return the data, but log the situation
  }
  
  // Check if the scraping was not successful based on the success field
  if (scrapingData.success === false) {
    console.error('Scraping failed:', scrapingData.message);
    throw new Error(scrapingData.message || "Помилка при скрапінгу");
  }
  
  // If we got here without any cars, that's still a problem
  if (Array.isArray(scrapingData.cars) && scrapingData.cars.length === 0) {
    console.error('No cars returned from scraper');
    throw new Error("Скрапер не знайшов жодного автомобіля. Перевірте логи функції.");
  }
  
  console.log('Scraping data validation successful');
  return scrapingData;
};

// Main scraping function that orchestrates the process
export const triggerScraping = async () => {
  try {
    console.log('Starting database connection check...');
    
    // Check database connection
    await checkDatabaseConnection();
    
    console.log('Database connection successful, starting scraping...');
    
    // Invoke scraping function
    const scrapingData = await invokeScrapingFunction();
    
    // Validate results
    const validatedData = validateScrapingResults(scrapingData);
    
    console.log('Scraping completed successfully:', validatedData);
    return validatedData;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    throw error;
  }
};
