
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScrapedCarCard from '@/components/scraped-cars/ScrapedCarCard';
import HTMLDisplay from '@/components/scraped-cars/HTMLDisplay';
import ScraperControls from '@/components/scraped-cars/ScraperControls';
import { ScraperResult, ScrapedCar } from '@/types/scraped-car';

const Auctions = () => {
  const { t } = useTranslation();
  const [scrapedData, setScrapedData] = useState<ScraperResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScraperResult = (result: ScraperResult) => {
    setScrapedData(result);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ScraperControls 
        onScraperResult={handleScraperResult}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      
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
                : t('auctions.noData', 'Click "Scrape Now" to load real auction cars')}
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
