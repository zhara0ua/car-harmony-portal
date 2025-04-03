
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
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

interface CarFiltersProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  category: string;
  setCategory: (value: string) => void;
  transmission: string;
  setTransmission: (value: string) => void;
  fuelType: string;
  setFuelType: (value: string) => void;
  make: string;
  setMake: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  uniqueMakes: string[];
  uniqueModels: string[];
  availableFuelTypes?: string[];
  availableTransmissions?: string[];
  isFilterDataLoading?: boolean;
}

const CarFilters = ({
  isOpen,
  setIsOpen,
  category,
  setCategory,
  transmission,
  setTransmission,
  fuelType,
  setFuelType,
  make,
  setMake,
  model,
  setModel,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  uniqueMakes,
  uniqueModels,
  availableFuelTypes = [],
  availableTransmissions = [],
  isFilterDataLoading = false,
}: CarFiltersProps) => {
  const { t } = useTranslation();
  
  // Default fuel types if none provided from API - updated to Polish
  const defaultFuelTypes = ["Benzyna", "Diesel", "Hybryd", "Elektro"];
  const fuelTypesToDisplay = availableFuelTypes.length > 0 ? availableFuelTypes : defaultFuelTypes;
  
  // Default transmissions if none provided from API - updated to Polish
  const defaultTransmissions = ["Automat", "Manualna", "Robot", "Bezstopniowa"];
  const transmissionsToDisplay = availableTransmissions.length > 0 ? availableTransmissions : defaultTransmissions;
  
  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-navy hover:text-navy/80 transition-colors mb-4">
          <span className="font-medium">{t("cars.filters.filters")}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t("cars.filters.make")}</Label>
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger>
                  <SelectValue placeholder={t("cars.filters.selectMake")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cars.filters.all")}</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.model")}</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder={t("cars.filters.selectModel")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cars.filters.all")}</SelectItem>
                  {uniqueModels.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.minPrice")}</Label>
              <Input
                type="number"
                placeholder={t("cars.filters.minPricePlaceholder")}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.maxPrice")}</Label>
              <Input
                type="number"
                placeholder={t("cars.filters.maxPricePlaceholder")}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("cars.filters.bodyType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cars.filters.all")}</SelectItem>
                  <SelectItem value="Седан">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Купе">Coupe</SelectItem>
                  <SelectItem value="Універсал">Kombi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.transmission")}</Label>
              <Select value={transmission} onValueChange={setTransmission} disabled={isFilterDataLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={t("cars.filters.transmissionType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cars.filters.all")}</SelectItem>
                  {transmissionsToDisplay.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.fuelType")}</Label>
              <Select value={fuelType} onValueChange={setFuelType} disabled={isFilterDataLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={t("cars.filters.fuelTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("cars.filters.all")}</SelectItem>
                  {fuelTypesToDisplay.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("cars.filters.sortBy")}</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder={t("cars.filters.sortByPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">{t("cars.filters.default")}</SelectItem>
                  <SelectItem value="price-asc">{t("cars.filters.priceLowToHigh")}</SelectItem>
                  <SelectItem value="price-desc">{t("cars.filters.priceHighToLow")}</SelectItem>
                  <SelectItem value="year-desc">{t("cars.filters.yearNewestFirst")}</SelectItem>
                  <SelectItem value="year-asc">{t("cars.filters.yearOldestFirst")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CarFilters;
