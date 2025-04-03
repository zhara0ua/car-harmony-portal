
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownZA, ArrowUpZA } from "lucide-react";
import { SortField, SortOrder } from "@/hooks/useAuctionCars";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  // Helper function to determine if a sort option is active
  const isActive = (field: SortField, order: SortOrder) => {
    return field === sortField && order === sortOrder;
  };
  
  // Helper to get correct icon for sort direction
  const getIcon = (order: SortOrder) => {
    return order === 'asc' 
      ? <ArrowUpAZ className="h-4 w-4 ml-1" /> 
      : <ArrowDownZA className="h-4 w-4 ml-1" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Sortuj
          {sortField && sortOrder && getIcon(sortOrder)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Name sorting */}
        <DropdownMenuItem 
          onClick={() => onSort('title')}
          className={isActive('title', 'asc') ? "bg-accent" : ""}
        >
          Nazwa A-Z <ArrowUpAZ className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSort('title')}
          className={isActive('title', 'desc') ? "bg-accent" : ""}
        >
          Nazwa Z-A <ArrowDownZA className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Year sorting */}
        <DropdownMenuItem 
          onClick={() => onSort('year')}
          className={isActive('year', 'asc') ? "bg-accent" : ""}
        >
          Rok (najstarsze) <ArrowUpAZ className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSort('year')}
          className={isActive('year', 'desc') ? "bg-accent" : ""}
        >
          Rok (najnowsze) <ArrowDownZA className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Price sorting */}
        <DropdownMenuItem 
          onClick={() => onSort('start_price')}
          className={isActive('start_price', 'asc') ? "bg-accent" : ""}
        >
          Cena (od najniższej) <ArrowUpAZ className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSort('start_price')}
          className={isActive('start_price', 'desc') ? "bg-accent" : ""}
        >
          Cena (od najwyższej) <ArrowDownZA className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* End date sorting */}
        <DropdownMenuItem 
          onClick={() => onSort('end_date')}
          className={isActive('end_date', 'asc') ? "bg-accent" : ""}
        >
          Data zakończenia (najwcześniej) <ArrowUpAZ className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSort('end_date')}
          className={isActive('end_date', 'desc') ? "bg-accent" : ""}
        >
          Data zakończenia (najpóźniej) <ArrowDownZA className="h-4 w-4 ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
