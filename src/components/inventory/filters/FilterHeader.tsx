
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  CollapsibleTrigger
} from "@/components/ui/collapsible";

interface FilterHeaderProps {
  isOpen: boolean;
  label: string;
}

const FilterHeader = ({ isOpen, label }: FilterHeaderProps) => {
  return (
    <CollapsibleTrigger className="flex items-center gap-2 text-navy hover:text-navy/80 transition-colors mb-4">
      <span className="font-medium">{label}</span>
      {isOpen ? (
        <ChevronUp className="h-5 w-5" />
      ) : (
        <ChevronDown className="h-5 w-5" />
      )}
    </CollapsibleTrigger>
  );
};

export default FilterHeader;
