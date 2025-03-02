
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { scraperService } from '@/services/scraperService';
import { ScraperResult } from '@/types/scraped-car';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HTMLDisplay from '@/components/scraped-cars/HTMLDisplay';

type ScraperType = 'findcar' | 'openlane';

const Parser = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [scraperType, setScraperType] = useState<ScraperType>('findcar');

  const handleScrape = async () => {
    setIsLoading(true);
    setError(null);
    setUsingMockData(false);
    
    try {
      console.log(`Attempting to scrape ${scraperType === 'findcar' ? 'FindCar' : 'OpenLane'} page...`);
      
      const result = scraperType === 'findcar' 
        ? await scraperService.scrapeFindCar()
        : await scraperService.scrapeOpenLane();
      
      if (result.success) {
        // Check if we're using mock data
        if (result.note && result.note.includes("mock data")) {
          setUsingMockData(true);
          toast({
            title: "Using Mock Data",
            description: "Edge Function failed, displaying mock data instead",
            duration: 5000,
          });
        } else {
          toast({
            title: "Scraping Successful",
            description: "Successfully retrieved HTML content",
            duration: 3000,
          });
        }
        
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
          <h2 className="text-2xl font-bold">OpenLane HTML Parser</h2>
          {lastScraped && (
            <p className="text-sm text-muted-foreground">Last scraped: {lastScraped}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select 
            value={scraperType} 
            onValueChange={(value) => setScraperType(value as ScraperType)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="findcar">FindCar</SelectItem>
              <SelectItem value="openlane">OpenLane</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[140px]"
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
                <li>The scraping operation might have timed out</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {usingMockData && !error && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Using Mock Data</AlertTitle>
          <AlertDescription>
            <p>The Edge Function could not be reached, so mock data is being displayed instead.</p>
            <p className="mt-2 text-sm">To use real data, please ensure your Supabase Edge Functions are properly deployed.</p>
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
                {t('parser.noData', 'Click "Scrape Now" to load HTML content')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Parser;
