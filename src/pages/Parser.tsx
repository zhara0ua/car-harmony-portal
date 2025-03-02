
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { scraperService } from '@/services/scraperService';
import { ScraperResult } from '@/types/scraped-car';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import HTMLDisplay from '@/components/scraped-cars/HTMLDisplay';

const Parser = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to scrape FindCar page...");
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
        setError(result.error || "Unknown error occurred");
        toast({
          title: "Scraping Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
          duration: 4000,
        });
        // Still set HTML content if it exists, even on "error" responses
        if (result.html) {
          setHtmlContent(result.html);
        }
      }
    } catch (error) {
      console.error("Error during scraping:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to scrape website";
      setError(`Edge Function Error: ${errorMessage}. Please check if the Edge Function is deployed and accessible.`);
      toast({
        title: "Error",
        description: errorMessage,
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
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2 text-sm">
              <p>Possible causes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>The Edge Function is not deployed correctly</li>
                <li>There might be network connectivity issues</li>
                <li>The external website might be blocking the request</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-6">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg">{t('parser.loading', 'Loading HTML content...')}</p>
            </CardContent>
          </Card>
        ) : htmlContent ? (
          <HTMLDisplay html={htmlContent} isLoading={isLoading} />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-lg">
                {t('parser.noData', 'Click "Scrape Now" to load HTML content from OpenLane FindCar page')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Parser;
