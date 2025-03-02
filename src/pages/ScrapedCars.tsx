import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { type Filters, type ScrapedCar } from "@/types/scraped-car";
import { triggerScraping } from "@/utils/scraping";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrapedCarsFilters } from "@/components/scraped-cars/ScrapedCarsFilters";
import { ScrapingActions } from "@/components/scraped-cars/ScrapingActions";
import { HtmlContentCard } from "@/components/scraped-cars/HtmlContentCard";
import { HtmlDialog } from "@/components/scraped-cars/HtmlDialog";
import { ErrorDialog } from "@/components/scraped-cars/ErrorDialog";
import { CarsList } from "@/components/scraped-cars/CarsList";

export default function ScrapedCars() {
  const [filters, setFilters] = useState<Filters>({});
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isHtmlDialogOpen, setIsHtmlDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (htmlContent) {
      console.log('HTML content updated, length:', htmlContent.length);
    } else {
      console.log('HTML content is null or empty');
    }
  }, [htmlContent]);
  
  const { data: cars, isLoading, refetch } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      console.log('Fetching cars with filters:', filters);
      let query = supabase
        .from('scraped_cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.fuelType) {
        query = query.eq('fuel_type', filters.fuelType);
      }
      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;
      
      console.log('Query result:', { data, error });
      
      if (error) throw error;
      return data as ScrapedCar[];
    }
  });

  const extractHtmlFromResponse = (result: any): string | null => {
    console.log('Extracting HTML from response:', result);
    
    if (!result) return null;
    
    const possibleHtmlLocations = [
      result.htmlContent,
      result.raw_html,
      result.debug?.htmlContent,
      result.debug?.raw_html,
      result.error?.htmlContent,
      result.error?.raw_html
    ];
    
    for (const location of possibleHtmlLocations) {
      if (typeof location === 'string' && location.includes('<!DOCTYPE html>')) {
        console.log('Found HTML directly in result');
        return location;
      }
    }
    
    const findHtmlInObject = (obj: any, depth = 0): string | null => {
      if (depth > 10) return null;
      
      if (!obj || typeof obj !== 'object') return null;
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && 
            (value.includes('<!DOCTYPE html>') || 
             value.includes('<html') || 
             value.includes('<body'))) {
          console.log(`Found HTML in object at key ${key}`);
          return value;
        }
        
        if (value && typeof value === 'object') {
          const nestedHtml = findHtmlInObject(value, depth + 1);
          if (nestedHtml) return nestedHtml;
        }
      }
      
      return null;
    };
    
    const deepSearchHtml = findHtmlInObject(result);
    if (deepSearchHtml) {
      console.log('Found HTML through deep object search');
      return deepSearchHtml;
    }
    
    console.log('No HTML content found in the response');
    return null;
  };

  const handleScraping = async () => {
    try {
      setIsScrapingInProgress(true);
      toast({
        title: "Початок скрапінгу",
        description: "Запускаємо процес отримання даних. Це може зайняти кілька хвилин...",
      });
      
      console.log('Starting scraping process...');
      const result = await triggerScraping();
      
      console.log('Scraping result received:', result);
      
      const extractedHtml = extractHtmlFromResponse(result);
      
      if (extractedHtml) {
        console.log(`Setting HTML content (${extractedHtml.length} chars)`);
        console.log('HTML preview:', extractedHtml.substring(0, 100) + '...');
        setHtmlContent(extractedHtml);
      } else {
        console.log('No HTML content found, creating fallback HTML');
        const fallbackHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OpenLane HTML Content Not Found</title>
            <meta charset="utf-8">
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px; border-radius: 5px;">
              <h1>No OpenLane HTML Content</h1>
              <p>The scraper did not return HTML content from OpenLane. This is a generated fallback message.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
              <p>Response data:</p>
              <pre>${JSON.stringify(result, null, 2)}</pre>
            </div>
          </body>
          </html>
        `;
        console.log('Setting fallback HTML content');
        setHtmlContent(fallbackHtml);
      }
      
      toast({
        title: "Успіх",
        description: result.message || "Дані успішно оновлено",
      });
      
      console.log('Scraping completed, refreshing data...');
      refetch();
    } catch (error) {
      console.error('Error during scraping:', error);
      
      let errorMsg = "Не вдалося отримати дані з сайту";
      let detailsMsg = "";
      const errorObj = error as any;
      
      if (errorObj?.message) {
        errorMsg = errorObj.message;
        
        if (errorMsg.includes(" - ")) {
          const parts = errorMsg.split(" - ");
          errorMsg = parts[0];
          detailsMsg = parts.slice(1).join(" - ");
        }
      }
      
      let errorHtml = extractHtmlFromResponse(errorObj);
      
      if (!errorHtml) {
        errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OpenLane Scraper Error</title>
            <meta charset="utf-8">
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid red; margin: 20px; border-radius: 5px; color: red;">
              <h1>Error Occurred During OpenLane Scraping</h1>
              <p><strong>Error:</strong> ${errorMsg}</p>
              ${detailsMsg ? `<p><strong>Details:</strong> ${detailsMsg}</p>` : ''}
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Error object:</strong></p>
              <pre>${JSON.stringify(errorObj, null, 2)}</pre>
            </div>
          </body>
          </html>
        `;
      }
      
      console.log('Setting error HTML content');
      setHtmlContent(errorHtml);
      
      setErrorMessage(errorMsg);
      setErrorDetails(detailsMsg);
      setIsErrorDialogOpen(true);
      
      toast({
        title: "Помилка скрапінгу",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    console.log('Applying new filters:', newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Автомобілі з OpenLane</h1>
            <ScrapingActions 
              onScrape={handleScraping}
              isScrapingInProgress={isScrapingInProgress}
              htmlContent={htmlContent}
              onShowHtml={() => setIsHtmlDialogOpen(true)}
            />
          </div>

          <ScrapedCarsFilters onFilterChange={handleFilterChange} />
          
          <HtmlContentCard htmlContent={htmlContent} />

          <CarsList cars={cars} isLoading={isLoading} />
        </div>
      </main>

      <Footer />

      <ErrorDialog 
        isOpen={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        errorMessage={errorMessage}
        errorDetails={errorDetails}
      />

      <HtmlDialog 
        isOpen={isHtmlDialogOpen}
        onOpenChange={setIsHtmlDialogOpen}
        htmlContent={htmlContent}
      />
    </div>
  );
}
