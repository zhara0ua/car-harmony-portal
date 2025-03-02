
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { type Filters } from "@/types/scraped-car";

interface ScrapedCarsFiltersProps {
  onFilterChange: (filters: Partial<Filters>) => void;
}

export const ScrapedCarsFilters = ({ onFilterChange }: ScrapedCarsFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="grid gap-2">
        <Label>Рік від</Label>
        <Input 
          type="number" 
          placeholder="2015"
          onChange={(e) => onFilterChange({ minYear: e.target.value || undefined })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Рік до</Label>
        <Input 
          type="number" 
          placeholder="2024"
          onChange={(e) => onFilterChange({ maxYear: e.target.value || undefined })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Ціна від</Label>
        <Input 
          type="number" 
          placeholder="10000"
          onChange={(e) => onFilterChange({ minPrice: e.target.value || undefined })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Ціна до</Label>
        <Input 
          type="number" 
          placeholder="50000"
          onChange={(e) => onFilterChange({ maxPrice: e.target.value || undefined })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Паливо</Label>
        <Select onValueChange={(value) => onFilterChange({ fuelType: value === "all" ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Всі типи" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі типи</SelectItem>
            <SelectItem value="petrol">Бензин</SelectItem>
            <SelectItem value="diesel">Дизель</SelectItem>
            <SelectItem value="hybrid">Гібрид</SelectItem>
            <SelectItem value="electric">Електро</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>КПП</Label>
        <Select onValueChange={(value) => onFilterChange({ transmission: value === "all" ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Всі типи" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі типи</SelectItem>
            <SelectItem value="automatic">Автомат</SelectItem>
            <SelectItem value="manual">Механіка</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
