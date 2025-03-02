
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScrapedCarCard from '@/components/scraped-cars/ScrapedCarCard';
import HTMLDisplay from '@/components/scraped-cars/HTMLDisplay';
import ScraperControls from '@/components/scraped-cars/ScraperControls';
import { ScraperResult, ScrapedCar } from '@/types/scraped-car';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, Clock, ServerCrash, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Auctions = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [scrapedData, setScrapedData] = useState<ScraperResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [edgeFunctionError, setEdgeFunctionError] = useState<string | null>(null);

  const handleScraperResult = (result: ScraperResult) => {
    setScrapedData(result);
    
    if (result.error && (
      result.error.includes("Edge Function") ||
      result.error.includes("Network error") ||
      result.error.includes("Failed to invoke") ||
      result.error.includes("Failed to send")
    )) {
      setEdgeFunctionError(result.error);
    } else {
      setEdgeFunctionError(null);
    }
    
    setUsingMockData(result.note?.includes('mock data') || false);
  };

  const copyDeployCommand = () => {
    const command = 'supabase functions deploy scrape-openlane scrape-findcar --project-ref btkfrowwhgcnzgncjjny';
    navigator.clipboard.writeText(command);
    toast({
      title: "Command Copied",
      description: "Supabase functions deploy command copied to clipboard",
      duration: 3000,
    });
  };

  const renderTroubleshootingGuidance = () => {
    const isNon2xxError = edgeFunctionError?.includes('non-2xx status code');
    const hasStatusCode = scrapedData?.statusCode !== undefined;
    
    return (
      <div className="mt-4 space-y-3">
        <div className="bg-destructive/10 p-3 rounded-md">
          <h4 className="font-semibold flex items-center gap-1 mb-2">
            <Terminal className="h-4 w-4" /> 
            Edge Functions Not Deployed
          </h4>
          <p className="text-sm mb-2">There are two ways to fix this:</p>
          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>
              <strong>Option 1:</strong> Enable "Use mock data" in the controls above to work with sample data without deploying Edge Functions
            </li>
            <li>
              <strong>Option 2:</strong> Deploy the Edge Functions by running this command in your terminal:
              <div className="relative mt-1">
                <pre className="bg-background p-2 rounded border text-xs overflow-x-auto">
                  supabase functions deploy scrape-openlane scrape-findcar --project-ref btkfrowwhgcnzgncjjny
                </pre>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1 h-6 text-xs"
                  onClick={copyDeployCommand}
                >
                  Copy
                </Button>
              </div>
            </li>
          </ol>
        </div>
        
        {isNon2xxError && hasStatusCode && (
          <div className="bg-amber-500/10 p-3 rounded-md border border-amber-500/30">
            <h4 className="font-semibold">Authentication Issue Detected</h4>
            <p className="text-sm mt-1">
              Status code {scrapedData?.statusCode} indicates the Edge Function is accessible but returned an error. 
              This is often caused by:
            </p>
            <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
              <li>Missing JWT authentication</li>
              <li>Invalid API key</li>
              <li>Missing or incorrect environment variables in the Edge Function</li>
            </ul>
            <p className="text-sm mt-2">
              Try enabling "Use mock data" in the controls above to bypass this issue.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ScraperControls 
        onScraperResult={handleScraperResult}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      
      {edgeFunctionError && (
        <Alert variant="destructive" className="mb-6">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Edge Function Error</AlertTitle>
          <AlertDescription>
            <p className="font-medium">{edgeFunctionError}</p>
            
            {renderTroubleshootingGuidance()}
          </AlertDescription>
        </Alert>
      )}
      
      {scrapedData?.error && !edgeFunctionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {scrapedData.error}
            <div className="mt-2 text-sm">
              <p>Possible causes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>The external website might be blocking the request</li>
                <li>The scraping operation might have timed out</li>
                <li>The website structure may have changed</li>
                <li>There might be network connectivity issues</li>
              </ul>
              <p className="mt-2">Try enabling "Use mock data" in the controls above to use sample data instead.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {usingMockData && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Using Mock Data</AlertTitle>
          <AlertDescription>
            <p>You're currently viewing mock data instead of live scraped results.</p>
            <p className="mt-2 text-sm">This is perfect for development and testing without needing to deploy Edge Functions.</p>
          </AlertDescription>
        </Alert>
      )}
      
      {!scrapedData?.error && !scrapedData?.cars && isLoading && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>Waiting for Page Content</AlertTitle>
          <AlertDescription>
            <p>The scraper is waiting for the page to fully load. This may take some time for dynamic content.</p>
            <p className="mt-2 text-sm">Try increasing the wait time if no results are found.</p>
          </AlertDescription>
        </Alert>
      )}
      
      {scrapedData?.cars && scrapedData.cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scrapedData.cars.map((car: ScrapedCar) => (
            <ScrapedCarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {isLoading ? (
            <p className="text-lg">{t('auctions.loading', 'Loading auction cars...')}</p>
          ) : (
            <p className="text-lg">
              {scrapedData?.error 
                ? t('auctions.error', 'Error: {{error}}', { error: scrapedData.error })
                : scrapedData
                  ? t('auctions.noData', 'No cars found. This could be because the website is not accessible or its structure has changed.')
                  : t('auctions.noData', 'Click "Scrape Now" to load auction cars')
              }
            </p>
          )}
        </div>
      )}
      
      <HTMLDisplay 
        html={scrapedData?.html} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default Auctions;
