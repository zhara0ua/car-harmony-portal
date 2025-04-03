
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FilterSectionProps {
  label: string;
  children: ReactNode;
}

const FilterSection = ({ label, children }: FilterSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
};

export default FilterSection;
