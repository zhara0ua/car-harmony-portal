import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrapedCarCard } from "@/components/scraped-cars/ScrapedCarCard";
import { ScrapedCarsFilters } from "@/components/scraped-cars/ScrapedCarsFilters";
import { useToast } from "@/components/ui/use-toast";
import { type Filters, type ScrapedCar } from "@/types/scraped-car";
import { triggerScraping } from "@/utils/scraping";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ScrapedCars() {
  const [filters, setFilters] = useState<Filters>({});
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
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
      
      if (result.debug && result.debug.htmlContent) {
        setHtmlContent(result.debug.htmlContent);
      } else {
        setHtmlContent(null);
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
        setHtmlContent(errorObj.htmlContent);
      } else {
        setHtmlContent(null);
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
            <Button
              variant="outline"
              onClick={handleScraping}
              disabled={isScrapingInProgress}
              className="flex items-center gap-2"
            >
              {isScrapingInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Завантаження...</span>
                </>
              ) : (
                "Оновити дані"
              )}
            </Button>
          </div>

          <ScrapedCarsFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Завантаження...</p>
            </div>
          ) : !cars?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Немає доступних автомобілів
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <ScrapedCarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Помилка скрапінгу
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>{errorMessage}</p>
              {errorDetails && (
                <div className="mt-2 p-3 bg-muted text-sm rounded-md overflow-auto max-h-40">
                  {errorDetails}
                </div>
              )}
              <p className="text-sm font-medium mt-2">
                Будь ласка, перевірте логи сервера або спробуйте пізніше.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {htmlContent && (
            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between my-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML вміст сторінки
                </h3>
              </div>
              <ScrollArea className="h-[40vh] border rounded-md p-4 bg-muted/50">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {htmlContent}
                </pre>
              </ScrollArea>
            </div>
          )}
          
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction onClick={() => setIsErrorDialogOpen(false)}>
              Зрозуміло
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
