
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
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

interface FiltersSectionProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  make: string;
  setMake: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  transmission: string;
  setTransmission: (value: string) => void;
  fuelType: string;
  setFuelType: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  uniqueMakes: string[];
  uniqueModels: string[];
}

const FiltersSection = ({
  isOpen,
  setIsOpen,
  make,
  setMake,
  model,
  setModel,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  category,
  setCategory,
  transmission,
  setTransmission,
  fuelType,
  setFuelType,
  sortBy,
  setSortBy,
  uniqueMakes,
  uniqueModels,
}: FiltersSectionProps) => {
  return (
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
  );
};

export default FiltersSection;
