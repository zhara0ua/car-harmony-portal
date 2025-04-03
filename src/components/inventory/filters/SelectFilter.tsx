
import { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FilterSection from "./FilterSection";

interface SelectFilterProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<string | { value: string; label: ReactNode }>;
  allOptionLabel: string;
  disabled?: boolean;
}

const SelectFilter = ({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  allOptionLabel,
  disabled = false,
}: SelectFilterProps) => {
  return (
    <FilterSection label={label}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allOptionLabel}</SelectItem>
          {options.map((option) => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            
            return (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </FilterSection>
  );
};

export default SelectFilter;
