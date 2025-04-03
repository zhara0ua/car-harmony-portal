
import { Input } from "@/components/ui/input";
import FilterSection from "./FilterSection";

interface PriceFilterProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}

const PriceFilter = ({
  label,
  value,
  onValueChange,
  placeholder,
}: PriceFilterProps) => {
  return (
    <FilterSection label={label}>
      <Input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </FilterSection>
  );
};

export default PriceFilter;
