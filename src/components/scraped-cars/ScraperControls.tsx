import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScraperResult } from '@/types/scraped-car';
import { scraperService } from '@/services/scraperService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

type ScraperSource = 'openlane' | 'findcar';

interface ScraperControlsProps {
  onScraperResult: (result: ScraperResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ScraperControls = ({ onScraperResult, isLoading, setIsLoading }: ScraperControlsProps) => {
  const { toast } = useToast();
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [scraperSource, setScraperSource] = useState<ScraperSource>('openlane');
  const [waitTime, setWaitTime] = useState<number>(5); // Default 5 seconds wait time

  const handleScrape = async () => {
    setIsLoading(true);
    
    try {
      // Calculate timeout in milliseconds (add 30 seconds base time)
      const timeout = (waitTime + 30) * 1000;
      
      let result;
      if (scraperSource === 'findcar') {
        result = await scraperService.scrapeFindCar({ timeout });
      } else {
        result = await scraperService.scrapeOpenLane({ timeout });
      }
      
      if (result.success) {
        if (result.note && result.note.includes("mock data")) {
          toast({
            title: "Using Mock Data",
            description: "Edge Function failed, displaying mock data instead",
            duration: 5000,
          });
        } else if (result.cars && result.cars.length > 0) {
          toast({
            title: "Scraping Successful",
            description: `Found ${result.cars.length} cars`,
            duration: 3000,
          });
        } else {
          toast({
            title: "No Cars Found",
            description: "The scraper didn't find any cars on the website",
            duration: 4000,
          });
        }
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
      <div className="flex flex-col w-full sm:w-auto gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select 
            value={scraperSource} 
            onValueChange={(value) => setScraperSource(value as ScraperSource)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openlane">OpenLane</SelectItem>
              <SelectItem value="findcar">FindCar</SelectItem>
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
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Wait time: {waitTime} seconds
          </label>
          <Slider
            value={[waitTime]}
            min={2}
            max={20}
            step={1}
            disabled={isLoading}
            onValueChange={(values) => setWaitTime(values[0])}
            className="w-full sm:w-[250px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ScraperControls;
