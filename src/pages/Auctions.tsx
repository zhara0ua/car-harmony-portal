
import React, { useState } from 'react';
import { ScraperControls } from '@/components/scraped-cars/ScraperControls';
import { ScrapedCarCard } from '@/components/scraped-cars/ScrapedCarCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScraperService } from '@/services/scraperService';
import { ScrapedCar } from '@/types/scraped-car';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Info } from 'lucide-react';

const Auctions = () => {
  const [cars, setCars] = useState<ScrapedCar[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const { toast } = useToast();

  const handleScrape = async (site: string, url: string, useMockOption: boolean) => {
    setLoading(true);
    setErrorMessage(null);
    setCars([]);
    
    try {
      const scraperService = new ScraperService();
      const result = await scraperService.scrape(site, url, useMockOption);
      
      if (result.success) {
        setCars(result.cars);
        toast({
          title: "Scraping completed",
          description: `Found ${result.cars.length} cars from ${site}`,
        });
      } else {
        setErrorMessage(result.message || "Scraping failed, but returned some results");
        if (result.cars && result.cars.length > 0) {
          setCars(result.cars);
          toast({
            title: "Warning",
            description: "Using mock data due to scraping issues",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in scraping:", error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Failed to scrape car data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Аукціони автомобілів</h1>
      
      {!useMockData && errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
            <div className="mt-2">
              Tip: Toggle "Use mock data" to see example results without using Edge Functions.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Аукціон інформація</AlertTitle>
        <AlertDescription>
          Ця сторінка дозволяє переглядати автомобілі з популярних аукціонів. 
          {!useMockData && (
            <div className="font-bold mt-2">
              Якщо виникають помилки Edge Function, увімкніть опцію "Use mock data" щоб побачити приклади автомобілів.
            </div>
          )}
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Параметри пошуку</CardTitle>
          <CardDescription>Оберіть сайт аукціону та введіть URL для пошуку</CardDescription>
        </CardHeader>
        <CardContent>
          <ScraperControls 
            onScrape={handleScrape} 
            loading={loading} 
            useMockData={useMockData}
            onUseMockDataChange={setUseMockData}
          />
        </CardContent>
      </Card>

      {cars.length > 0 && (
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Результати ({cars.length} авто)</h2>
            <TabsList>
              <TabsTrigger value="grid">Сітка</TabsTrigger>
              <TabsTrigger value="list">Список</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, index) => (
                <ScrapedCarCard key={index} car={car} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="space-y-4">
              {cars.map((car, index) => (
                <ScrapedCarCard key={index} car={car} layout="list" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!loading && cars.length === 0 && !errorMessage && (
        <div className="text-center p-12 border rounded-lg">
          <p className="text-xl text-gray-500">
            Оберіть сайт аукціону та натисніть "Шукати" для отримання результатів
          </p>
        </div>
      )}
    </div>
  );
};

export default Auctions;
