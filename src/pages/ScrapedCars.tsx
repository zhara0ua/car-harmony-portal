
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
  
  // Debugging effect to confirm when htmlContent changes
  useEffect(() => {
    console.log('HTML content state updated:', htmlContent ? 'Content available' : 'No content');
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
      
      // Extract HTML content regardless of where it might be in the response
      let extractedHtml = null;
      
      // Try to extract HTML from all possible locations
      if (result.debug?.htmlContent) {
        console.log('Found HTML in result.debug.htmlContent');
        extractedHtml = result.debug.htmlContent;
      } else if (result.htmlContent) {
        console.log('Found HTML in result.htmlContent');
        extractedHtml = result.htmlContent;
      } else if (result.error?.htmlContent) {
        console.log('Found HTML in result.error.htmlContent');
        extractedHtml = result.error.htmlContent;
      } else if (typeof result === 'object') {
        // Deep search for htmlContent property
        const findHtmlContent = (obj: any): string | null => {
          if (!obj || typeof obj !== 'object') return null;
          
          if (obj.htmlContent) return obj.htmlContent;
          
          for (const key in obj) {
            if (typeof obj[key] === 'object') {
              const found = findHtmlContent(obj[key]);
              if (found) return found;
            }
          }
          
          return null;
        };
        
        extractedHtml = findHtmlContent(result);
        if (extractedHtml) {
          console.log('Found HTML through deep search');
        }
      }
      
      // Set the HTML content regardless of result success/error
      if (extractedHtml) {
        console.log('Setting HTML content');
        setHtmlContent(extractedHtml);
      } else {
        console.log('No HTML content found in the response');
        // Create mock HTML content so users always see something
        const mockHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Fallback HTML Content</title>
          </head>
          <body>
            <div>
              <h1>Fallback HTML Content</h1>
              <p>The scraper did not return HTML content. This is a fallback message.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `;
        console.log('Setting fallback HTML content');
        setHtmlContent(mockHtml);
      }
      
      toast({
        title: "Успіх",
        description: result.message || "Дані успішно оновлено",
      });
      
      console.log('Scraping completed, refreshing data...');
      refetch();
    } catch (error) {
      console.error('Error during scraping:', error);
      
      let errorMsg = error instanceof Error ? error.message : "Не вдалося отримати дані з сайту";
      let detailsMsg = "";
      
      if (errorMsg.includes(" - ")) {
        const parts = errorMsg.split(" - ");
        errorMsg = parts[0];
        detailsMsg = parts.slice(1).join(" - ");
      }
      
      // Try to extract HTML content from the error object
      const errorObj = error as any;
      if (errorObj?.htmlContent) {
        console.log('HTML content found in error object');
        setHtmlContent(errorObj.htmlContent);
      } else {
        // Create error HTML content so users always see something
        const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Error HTML Content</title>
          </head>
          <body>
            <div style="color: red;">
              <h1>Error Occurred</h1>
              <p>${errorMsg}</p>
              ${detailsMsg ? `<p>Details: ${detailsMsg}</p>` : ''}
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `;
        console.log('Setting error HTML content');
        setHtmlContent(errorHtml);
      }
      
      setErrorMessage(errorMsg);
      setErrorDetails(detailsMsg);
      setIsErrorDialogOpen(true);
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
            <h1 className="text-3xl font-bold">Автомобілі з CarOutlet</h1>
            <ScrapingActions 
              onScrape={handleScraping}
              isScrapingInProgress={isScrapingInProgress}
              htmlContent={htmlContent}
              onShowHtml={() => setIsHtmlDialogOpen(true)}
            />
          </div>

          <ScrapedCarsFilters onFilterChange={handleFilterChange} />
          
          {/* Show the HtmlContentCard with improved visibility */}
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
