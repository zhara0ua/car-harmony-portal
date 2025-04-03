
import { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import FilterHeader from "./FilterHeader";

interface FilterContainerProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  filterLabel: string;
  children: ReactNode;
}

const FilterContainer = ({
  isOpen,
  setIsOpen,
  filterLabel,
  children,
}: FilterContainerProps) => {
  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <FilterHeader isOpen={isOpen} label={filterLabel} />
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FilterContainer;
