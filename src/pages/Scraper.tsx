
import { useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FirecrawlService } from "@/utils/FirecrawlService";

interface CarData {
  title: string;
  price: string;
  year: string;
  mileage: string;
  source: string;
}

const WEBSITES = [
  'https://openlane.eu',
  'https://caroutlet.eu'
];

const Scraper = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState<CarData[]>([]);
  const [apiKey, setApiKey] = useState(FirecrawlService.getApiKey() || "");

  const startScraping = async () => {
    if (!apiKey) {
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть API ключ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    FirecrawlService.saveApiKey(apiKey);

    try {
      toast({
        title: "Початок парсингу",
        description: "Це може зайняти кілька хвилин...",
      });

      const allCars: CarData[] = [];

      for (const website of WEBSITES) {
        const result = await FirecrawlService.crawlWebsite(website);
        
        if (result.success && result.data) {
          const websiteCars = result.data.data.cars.map((car: any) => ({
            ...car,
            source: website
          }));
          allCars.push(...websiteCars);
        } else {
          toast({
            title: "Помилка",
            description: `Помилка при парсингу ${website}: ${result.error}`,
            variant: "destructive",
          });
        }
      }

      setCars(allCars);
      toast({
        title: "Готово!",
        description: `Знайдено ${allCars.length} автомобілів`,
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося отримати дані",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCars = cars.filter(car =>
    car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.year.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <h1 className="text-2xl font-bold">Парсер автомобілів</h1>
          
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Введіть Firecrawl API ключ"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-4"
            />
          </div>

          <Button
            onClick={startScraping}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Парсинг..." : "Почати парсинг"}
          </Button>
        </div>

        {cars.length > 0 && (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Пошук..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назва</TableHead>
                    <TableHead>Ціна</TableHead>
                    <TableHead>Рік</TableHead>
                    <TableHead>Пробіг</TableHead>
                    <TableHead>Джерело</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCars.map((car, index) => (
                    <TableRow key={index}>
                      <TableCell>{car.title}</TableCell>
                      <TableCell>{car.price}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.mileage}</TableCell>
                      <TableCell>{car.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Scraper;
