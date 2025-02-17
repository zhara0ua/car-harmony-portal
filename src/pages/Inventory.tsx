
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Car {
  id: number;
  image: string;
  name: string;
  make: string;
  model: string;
  price: string;
  price_number: number;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  created_at: string;
}

const Inventory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>("all");
  const [make, setMake] = useState<string>("all");
  const [model, setModel] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [visibleCars, setVisibleCars] = useState(9);
  const [cars, setCars] = useState<Car[]>([]);
  const { toast } = useToast();

  const fetchCars = async () => {
    try {
      let query = supabase
        .from('cars')
        .select('*');

      if (category !== "all") {
        query = query.eq('category', category);
      }
      if (transmission !== "all") {
        query = query.eq('transmission', transmission);
      }
      if (fuelType !== "all") {
        query = query.eq('fuel_type', fuelType);
      }
      if (make !== "all") {
        query = query.eq('make', make);
      }
      if (model !== "all") {
        query = query.eq('model', model);
      }
      if (minPrice) {
        query = query.gte('price_number', parseInt(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price_number', parseInt(maxPrice));
      }

      switch (sortBy) {
        case "price-asc":
          query = query.order('price_number', { ascending: true });
          break;
        case "price-desc":
          query = query.order('price_number', { ascending: false });
          break;
        case "year-desc":
          query = query.order('year', { ascending: false });
          break;
        case "year-asc":
          query = query.order('year', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити список автомобілів",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCars();
  }, [category, transmission, fuelType, make, model, minPrice, maxPrice, sortBy]);

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make)));
  const uniqueModels = Array.from(new Set(cars.filter(car => make === "all" || car.make === make).map(car => car.model)));

  const visibleFilteredCars = cars.slice(0, visibleCars);
  const hasMoreCars = visibleCars < cars.length;

  const loadMore = () => {
    setVisibleCars(prev => prev + 9);
  };

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-navy mb-8">Наші Автомобілі</h1>
        
        <div className="mb-8">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-navy hover:text-navy/80 transition-colors mb-4">
              <span className="font-medium">Фільтри</span>
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Марка</Label>
                  <Select value={make} onValueChange={(value) => setMake(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть марку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі марки</SelectItem>
                      {uniqueMakes.map((make) => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Модель</Label>
                  <Select value={model} onValueChange={(value) => setModel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть модель" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі моделі</SelectItem>
                      {uniqueModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ціна від</Label>
                  <Input
                    type="number"
                    placeholder="Мінімальна ціна"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ціна до</Label>
                  <Input
                    type="number"
                    placeholder="Максимальна ціна"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Тип кузова</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Тип кузова" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі типи</SelectItem>
                      <SelectItem value="Седан">Седан</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Купе">Купе</SelectItem>
                      <SelectItem value="Універсал">Універсал</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Коробка передач</Label>
                  <Select value={transmission} onValueChange={(value) => setTransmission(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Коробка передач" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі типи</SelectItem>
                      <SelectItem value="Автомат">Автомат</SelectItem>
                      <SelectItem value="Механіка">Механіка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Тип палива</Label>
                  <Select value={fuelType} onValueChange={(value) => setFuelType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Тип палива" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі типи</SelectItem>
                      <SelectItem value="Бензин">Бензин</SelectItem>
                      <SelectItem value="Дизель">Дизель</SelectItem>
                      <SelectItem value="Гібрид">Гібрид</SelectItem>
                      <SelectItem value="Електро">Електро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Сортування</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Сортувати за" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">За замовчуванням</SelectItem>
                      <SelectItem value="price-asc">Ціна (від низької до високої)</SelectItem>
                      <SelectItem value="price-desc">Ціна (від високої до низької)</SelectItem>
                      <SelectItem value="year-desc">Рік (новіші спочатку)</SelectItem>
                      <SelectItem value="year-asc">Рік (старіші спочатку)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleFilteredCars.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>

        {hasMoreCars && (
          <div className="mt-12 text-center">
            <Button 
              onClick={loadMore}
              className="px-8 rounded-full"
            >
              Завантажити ще
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Inventory;
