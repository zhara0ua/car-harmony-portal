
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { SortField, SortOrder } from "@/hooks/useAuctionCars";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface AuctionSortingProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const AuctionSorting = ({ 
  sortField, 
  sortOrder, 
  onSort 
}: AuctionSortingProps) => {
  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const getSortLabel = (field: SortField) => {
    switch (field) {
      case 'title': return 'Nazwa';
      case 'year': return 'Rok';
      case 'start_price': return 'Cena';
      case 'end_date': return 'Data zakończenia';
      default: return 'Nazwa';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Sortuj według {getSortLabel(sortField)} {renderSortIcon(sortField)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onSort('title')}>
          Nazwa {renderSortIcon('title')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('year')}>
          Rok {renderSortIcon('year')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('start_price')}>
          Cena {renderSortIcon('start_price')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('end_date')}>
          Data zakończenia {renderSortIcon('end_date')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
