
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { scraperService } from '@/services/scraperService';
import { ScraperResult } from '@/types/scraped-car';

const Parser = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  const handleScrape = async () => {
    setIsLoading(true);
    
    try {
      const result = await scraperService.scrapeFindCar();
      
      if (result.success) {
        toast({
          title: "Scraping Successful",
          description: "Successfully retrieved HTML content",
          duration: 3000,
        });
        setHtmlContent(result.html || null);
        setLastScraped(new Date().toLocaleString());
      } else {
        toast({
          title: "Scraping Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
          duration: 4000,
        });
        setHtmlContent(result.html || null);
      }
    } catch (error) {
      console.error("Error during scraping:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to scrape website",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">OpenLane FindCar HTML Parser</h2>
          {lastScraped && (
            <p className="text-sm text-muted-foreground">Last scraped: {lastScraped}</p>
          )}
        </div>
        <Button 
          onClick={handleScrape} 
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scrape Now
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg">{t('parser.loading', 'Loading HTML content...')}</p>
          </div>
        ) : htmlContent ? (
          <div className="border rounded-lg p-4 overflow-auto max-h-[70vh] bg-gray-50">
            <h3 className="text-lg font-medium mb-2">HTML Content:</h3>
            <pre className="whitespace-pre-wrap text-xs">{htmlContent}</pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">
              {t('parser.noData', 'Click "Scrape Now" to load HTML content from OpenLane FindCar page')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parser;
