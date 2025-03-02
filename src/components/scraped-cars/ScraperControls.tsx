
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Refresh } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScraperResult } from '@/types/scraped-car';
import { scraperService } from '@/services/scraperService';

interface ScraperControlsProps {
  onScraperResult: (result: ScraperResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ScraperControls = ({ onScraperResult, isLoading, setIsLoading }: ScraperControlsProps) => {
  const { toast } = useToast();
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  const handleScrape = async () => {
    setIsLoading(true);
    
    try {
      const result = await scraperService.scrapeOpenLane();
      
      if (result.success) {
        toast({
          title: "Scraping Successful",
          description: `Found ${result.cars?.length || 0} cars`,
          duration: 3000,
        });
        setLastScraped(new Date().toLocaleString());
      } else {
        toast({
          title: "Scraping Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
          duration: 4000,
        });
      }
      
      onScraperResult(result);
    } catch (error) {
      console.error("Error during scraping:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to scrape website",
        variant: "destructive",
        duration: 4000,
      });
      
      onScraperResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold">OpenLane Auction Cars</h2>
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
            <Refresh className="mr-2 h-4 w-4 animate-spin" />
            Scraping...
          </>
        ) : (
          <>
            <Refresh className="mr-2 h-4 w-4" />
            Scrape Now
          </>
        )}
      </Button>
    </div>
  );
};

export default ScraperControls;
