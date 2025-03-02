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
  const requestOptions = { 
    forceRealData: true,
    debugMode: true, // Enable debug mode to get more detailed logs
    captureHtml: true, // Request HTML capture
    selectors: [
      // Additional selectors to try for car listings
      '.vehicle-card-wrapper', 
      '.vehicle-list-container .item',
      '.car-tile-container',
      '.auction-item-wrapper',
      '.product-card',
      '.grid-item.vehicle',
      '.search-results-item',
      'article.vehicle-listing',
      '.car-card',
      '.listing-item',
      // Keep original selectors
      '.vehicle-list-item', 
      '.vehicle-card',
      '.car-listing',
      '.auction-item',
      'article.vehicle',
      'div[data-vehicle-id]',
      '.vehicle-tiles',
      '.tile',
      '.car-tile',
      '.product',
      '.car-item'
    ]
  };
  
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
        throw new Error("Помилка доступу до сайту OpenLane. Перевірте з'єднання з інтернетом або доступність сайту.");
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
    
    // Make sure we have the HTML content somewhere in the response
    if (data.debug?.htmlContent) {
      console.log('HTML content found in data.debug:', data.debug.htmlContent.substring(0, 50) + '...');
    } else if (data.htmlContent) {
      console.log('HTML content found directly in data:', data.htmlContent.substring(0, 50) + '...');
      // Move it to the debug property for consistency
      if (!data.debug) data.debug = {};
      data.debug.htmlContent = data.htmlContent;
    } else {
      console.log('No HTML content found in the initial response structure, doing deep search');
      
      // Deep search for HTML content in any part of the response
      const findHtmlContent = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        
        for (const key in obj) {
          if (key === 'htmlContent' && typeof obj[key] === 'string') {
            return obj[key];
          }
          
          if (typeof obj[key] === 'object') {
            const found = findHtmlContent(obj[key]);
            if (found) return found;
          }
        }
        
        return null;
      };
      
      const foundHtml = findHtmlContent(data);
      if (foundHtml) {
        console.log('Found HTML through deep search:', foundHtml.substring(0, 50) + '...');
        if (!data.debug) data.debug = {};
        data.debug.htmlContent = foundHtml;
      } else {
        console.log('No HTML content found in the entire response after deep search');
      }
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
  
  // Always capture HTML content from the response if available
  let htmlContent = null;
  if (scrapingData.debug && scrapingData.debug.htmlContent) {
    console.log('HTML content retrieved from debug.htmlContent');
    htmlContent = scrapingData.debug.htmlContent;
  } else if (scrapingData.htmlContent) {
    console.log('HTML content retrieved directly from response');
    htmlContent = scrapingData.htmlContent;
  }
  
  // Check if there's an error field in the response even if success is true
  if (scrapingData.error) {
    console.error('Error in response data:', scrapingData.error);
    const error = new Error(scrapingData.error || "Помилка при скрапінгу: " + scrapingData.error);
    (error as any).htmlContent = htmlContent;
    throw error;
  }
  
  // Check if debug information is available
  if (scrapingData.debug) {
    console.log('Debug information from scraper:', scrapingData.debug);
    
    // If there's HTML analysis in the debug info, log it
    if (scrapingData.debug.htmlAnalysis) {
      console.log('HTML structure analysis:', scrapingData.debug.htmlAnalysis);
    }
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
    
    const error = new Error(scrapingData.message || "Помилка при скрапінгу");
    (error as any).htmlContent = htmlContent;
    
    // If we have more detailed error information, include it in the error message
    if (scrapingData.errorDetails) {
      console.error('Error details:', scrapingData.errorDetails);
      error.message = `${scrapingData.message || "Помилка при скрапінгу"} - ${scrapingData.errorDetails}`;
    }
    
    throw error;
  }
  
  // If we got here without any cars, that's still a problem
  if (Array.isArray(scrapingData.cars) && scrapingData.cars.length === 0) {
    console.error('No cars returned from scraper');
    
    const error = new Error("Скрапер не знайшов жодного автомобіля. Перевірте логи функції.");
    (error as any).htmlContent = htmlContent;
    
    // If we have debug info about attempted selectors, include it
    if (scrapingData.debug && scrapingData.debug.attemptedSelectors) {
      console.error('Attempted selectors:', scrapingData.debug.attemptedSelectors);
      error.message = "Скрапер не знайшов жодного автомобіля. Спробовані селектори: " + 
        scrapingData.debug.attemptedSelectors.join(', ');
    }
    
    throw error;
  }
  
  // Add HTML content to the result object in all cases
  scrapingData.debug = scrapingData.debug || {};
  scrapingData.debug.htmlContent = htmlContent || scrapingData.debug.htmlContent;
  
  // If we still don't have HTML content, create a placeholder
  if (!scrapingData.debug.htmlContent) {
    console.log('No HTML content found in response, creating placeholder');
    scrapingData.debug.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Placeholder HTML Content</title>
        <meta charset="utf-8">
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px; border-radius: 5px;">
          <h1>No HTML Content Available</h1>
          <p>The scraper did not return any HTML content. This is a placeholder.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Response data summary:</p>
          <pre>${JSON.stringify({
            success: scrapingData.success,
            message: scrapingData.message,
            cars: Array.isArray(scrapingData.cars) ? `${scrapingData.cars.length} cars` : 'No cars',
            error: scrapingData.error || 'None'
          }, null, 2)}</pre>
        </div>
      </body>
      </html>
    `;
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
    
    console.log('Scraping completed successfully');
    
    // Ensure we always have HTML content in the response
    if (!validatedData.debug || !validatedData.debug.htmlContent) {
      console.log('No HTML content in validated data, adding mock HTML');
      if (!validatedData.debug) validatedData.debug = {};
      validatedData.debug.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mock HTML Content</title>
          <meta charset="utf-8">
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px; border-radius: 5px;">
            <h1>Mock Car Listings</h1>
            <p>This is mock HTML content since no actual HTML was returned</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <div class="car-listings">
              ${validatedData.cars && Array.isArray(validatedData.cars) ? validatedData.cars.map((car: any) => `
                <div class="car-listing" style="margin: 10px 0; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                  <h2>${car.title || 'Unknown Car'}</h2>
                  <p>Price: ${car.price || 'N/A'}</p>
                  <p>Year: ${car.year || 'N/A'}</p>
                  <p>Mileage: ${car.mileage || 'N/A'}</p>
                </div>
              `).join('') : '<p>No cars found</p>'}
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    return validatedData;
  } catch (error) {
    console.error('Error triggering scraping:', error);
    
    // Add HTML content to the error object
    const errorObj = error as any;
    if (!errorObj.htmlContent) {
      errorObj.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error HTML Content</title>
          <meta charset="utf-8">
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid red; margin: 20px; border-radius: 5px; color: red;">
            <h1>Error Occurred During Scraping</h1>
            <p><strong>Error:</strong> ${errorObj.message || 'Unknown error'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        </body>
        </html>
      `;
    }
    
    throw error;
  }
};
