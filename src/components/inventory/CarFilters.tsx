
import { useTranslation } from "react-i18next";
import FilterContainer from "./filters/FilterContainer";
import SelectFilter from "./filters/SelectFilter";
import PriceFilter from "./filters/PriceFilter";

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
    <FilterContainer 
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      filterLabel={t("cars.filters.filters")}
    >
      <SelectFilter
        label={t("cars.filters.make")}
        value={make}
        onValueChange={setMake}
        placeholder={t("cars.filters.selectMake")}
        options={uniqueMakes}
        allOptionLabel={t("cars.filters.all")}
      />

      <SelectFilter
        label={t("cars.filters.model")}
        value={model}
        onValueChange={setModel}
        placeholder={t("cars.filters.selectModel")}
        options={uniqueModels}
        allOptionLabel={t("cars.filters.all")}
      />

      <PriceFilter
        label={t("cars.filters.minPrice")}
        value={minPrice}
        onValueChange={setMinPrice}
        placeholder={t("cars.filters.minPricePlaceholder")}
      />

      <PriceFilter
        label={t("cars.filters.maxPrice")}
        value={maxPrice}
        onValueChange={setMaxPrice}
        placeholder={t("cars.filters.maxPricePlaceholder")}
      />

      <SelectFilter
        label={t("cars.filters.category")}
        value={category}
        onValueChange={setCategory}
        placeholder={t("cars.filters.bodyType")}
        options={[
          { value: "Седан", label: "Sedan" },
          { value: "SUV", label: "SUV" },
          { value: "Купе", label: "Coupe" },
          { value: "Універсал", label: "Kombi" }
        ]}
        allOptionLabel={t("cars.filters.all")}
      />

      <SelectFilter
        label={t("cars.filters.transmission")}
        value={transmission}
        onValueChange={setTransmission}
        placeholder={t("cars.filters.transmissionType")}
        options={transmissionsToDisplay}
        allOptionLabel={t("cars.filters.all")}
        disabled={isFilterDataLoading}
      />

      <SelectFilter
        label={t("cars.filters.fuelType")}
        value={fuelType}
        onValueChange={setFuelType}
        placeholder={t("cars.filters.fuelTypePlaceholder")}
        options={fuelTypesToDisplay}
        allOptionLabel={t("cars.filters.all")}
        disabled={isFilterDataLoading}
      />

      <SelectFilter
        label={t("cars.filters.sortBy")}
        value={sortBy}
        onValueChange={setSortBy}
        placeholder={t("cars.filters.sortByPlaceholder")}
        options={[
          { value: "default", label: t("cars.filters.default") },
          { value: "price-asc", label: t("cars.filters.priceLowToHigh") },
          { value: "price-desc", label: t("cars.filters.priceHighToLow") },
          { value: "year-desc", label: t("cars.filters.yearNewestFirst") },
          { value: "year-asc", label: t("cars.filters.yearOldestFirst") }
        ]}
        allOptionLabel=""
      />
    </FilterContainer>
  );
};

export default CarFilters;
