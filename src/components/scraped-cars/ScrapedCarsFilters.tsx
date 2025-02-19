
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Filters } from "@/types/scraped-car";

interface ScrapedCarsFiltersProps {
  onFilterChange: (filters: Partial<Filters>) => void;
}

export function ScrapedCarsFilters({ onFilterChange }: ScrapedCarsFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string | number | undefined) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div>
        <Input
          type="number"
          placeholder="Мін. рік"
          onChange={(e) => handleFilterChange('minYear', parseInt(e.target.value) || undefined)}
        />
      </div>
      <div>
        <Input
          type="number"
          placeholder="Макс. рік"
          onChange={(e) => handleFilterChange('maxYear', parseInt(e.target.value) || undefined)}
        />
      </div>
      <div>
        <Input
          type="number"
          placeholder="Мін. ціна"
          onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || undefined)}
        />
      </div>
      <div>
        <Input
          type="number"
          placeholder="Макс. ціна"
          onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || undefined)}
        />
      </div>
      <div>
        <Select onValueChange={(value) => handleFilterChange('fuelType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Тип палива" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Всі</SelectItem>
            <SelectItem value="petrol">Бензин</SelectItem>
            <SelectItem value="diesel">Дизель</SelectItem>
            <SelectItem value="hybrid">Гібрид</SelectItem>
            <SelectItem value="electric">Електро</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select onValueChange={(value) => handleFilterChange('transmission', value)}>
          <SelectTrigger>
            <SelectValue placeholder="КПП" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Всі</SelectItem>
            <SelectItem value="automatic">Автомат</SelectItem>
            <SelectItem value="manual">Механіка</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
