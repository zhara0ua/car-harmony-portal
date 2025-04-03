
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterActionsProps {
  onApply: () => void;
  onClear: () => void;
}

export const FilterActions = ({ onApply, onClear }: FilterActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2 flex items-end lg:col-start-3">
        <Button onClick={onApply} className="w-full">
          Zastosuj filtry
        </Button>
      </div>
      
      <div className="space-y-2 flex items-end">
        <Button onClick={onClear} variant="outline" className="w-full">
          Wyczyść filtry
        </Button>
      </div>
    </div>
  );
};
