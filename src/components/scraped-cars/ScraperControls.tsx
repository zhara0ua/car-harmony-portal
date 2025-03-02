
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScraperResult } from '@/types/scraped-car';
import { scraperService } from '@/services/scraperService';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScraperControlsProps {
  onScraperResult: (result: ScraperResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ScraperControls = ({ onScraperResult, isLoading, setIsLoading }: ScraperControlsProps) => {
  const { toast } = useToast();
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [scrapeSource, setScrapeSource] = useState<string>("caroutlet"); // Default to CarOutlet

  const handleScrape = async () => {
    setIsLoading(true);
    
    try {
      let result: ScraperResult;
      
      if (scrapeSource === "openlane") {
        result = await scraperService.scrapeOpenLane();
      } else {
        result = await scraperService.scrapeCarOutlet();
      }
      
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
        <h2 className="text-2xl font-bold">Auction Cars</h2>
        {lastScraped && (
          <p className="text-sm text-muted-foreground">Last scraped: {lastScraped}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select 
          value={scrapeSource} 
          onValueChange={setScrapeSource}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Scrape Source</SelectLabel>
              <SelectItem value="caroutlet">CarOutlet.eu</SelectItem>
              <SelectItem value="openlane">OpenLane</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
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
    </div>
  );
};

export default ScraperControls;
