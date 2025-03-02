
import { useState } from "react";
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
      
      console.log('Scraping result:', result);
      
      // Check if debug info with HTML content exists
      if (result.debug && result.debug.htmlContent) {
        console.log('HTML content found in result.debug');
        setHtmlContent(result.debug.htmlContent);
      } else if (result.htmlContent) {
        console.log('HTML content found directly in result');
        setHtmlContent(result.htmlContent);
      } else if (result.success === false && result.error) {
        console.log('Error found in result:', result.error);
        // Handle error but still show HTML if available
        const errorObj = result.error as any;
        if (errorObj?.htmlContent) {
          setHtmlContent(errorObj.htmlContent);
        }
      } else {
        console.log('No HTML content found in result');
        // Make sure we don't reset existing HTML content
        // setHtmlContent(null);
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
      
      const errorObj = error as any;
      if (errorObj?.htmlContent) {
        console.log('HTML content found in error object');
        setHtmlContent(errorObj.htmlContent);
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
          
          {/* Always display the HtmlContentCard */}
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
