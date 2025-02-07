
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface CarData {
  title: string;
  price: string;
  year: string;
  mileage: string;
  source: string;
}

const Scraper = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState<CarData[]>([]);

  const startScraping = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Початок парсингу",
        description: "Це може зайняти кілька хвилин...",
      });

      // Here we would make API call to backend scraping service
      // For now showing mock data
      const mockData: CarData[] = [
        {
          title: "BMW X5",
          price: "45000€",
          year: "2019",
          mileage: "50000",
          source: "openlane.eu"
        },
        {
          title: "Audi Q7",
          price: "55000€",
          year: "2020",
          mileage: "30000",
          source: "caroutlet.eu"
        }
      ];

      setCars(mockData);
      toast({
        title: "Готово!",
        description: "Дані успішно отримано",
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
