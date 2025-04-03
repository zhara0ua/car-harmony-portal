
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  onApply: () => void;
  onClear: () => void;
}

export const FilterActions = ({ onApply, onClear }: FilterActionsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button onClick={onApply} className="w-full">
        Zastosuj filtry
      </Button>
      
      <Button onClick={onClear} variant="outline" className="w-full">
        Wyczyść filtry
      </Button>
    </div>
  );
};
