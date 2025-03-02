
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScrapedCarCard from '@/components/scraped-cars/ScrapedCarCard';
import HTMLDisplay from '@/components/scraped-cars/HTMLDisplay';
import ScraperControls from '@/components/scraped-cars/ScraperControls';
import { ScraperResult, ScrapedCar } from '@/types/scraped-car';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, Clock, ServerCrash } from 'lucide-react';

const Auctions = () => {
  const { t } = useTranslation();
  const [scrapedData, setScrapedData] = useState<ScraperResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [edgeFunctionError, setEdgeFunctionError] = useState<string | null>(null);

  const handleScraperResult = (result: ScraperResult) => {
    setScrapedData(result);
    
    // Check if there's a network or edge function error
    if (result.error && (
      result.error.includes("Edge Function") ||
      result.error.includes("Network error") ||
      result.error.includes("Failed to invoke")
    )) {
      setEdgeFunctionError(result.error);
    } else {
      setEdgeFunctionError(null);
    }
    
    // Check if we're using mock data
    setUsingMockData(result.note?.includes('mock data') || false);
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
            <p>{edgeFunctionError}</p>
            <div className="mt-2 text-sm">
              <p>Steps to fix this issue:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1">
                <li>Ensure your Supabase project is running</li>
                <li>Verify that the Edge Functions have been deployed with <code>supabase functions deploy --project-ref YOUR_PROJECT_REF</code></li>
                <li>Check the Edge Function logs in the Supabase Dashboard</li>
                <li>Confirm that your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are set correctly</li>
              </ol>
            </div>
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
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {usingMockData && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Using Mock Data</AlertTitle>
          <AlertDescription>
            <p>The Edge Function could not be reached, so mock data is being displayed instead.</p>
            <p className="mt-2 text-sm">To use real data, please ensure your Supabase Edge Functions are properly deployed using:</p>
            <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
              supabase functions deploy scrape-openlane scrape-findcar --project-ref btkfrowwhgcnzgncjjny
            </pre>
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
