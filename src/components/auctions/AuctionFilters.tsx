
import { useState } from "react";
import { AuctionFilters as AuctionFiltersType } from "@/types/auction-car";
import { AuctionFilterCard } from "@/components/auctions/filters/AuctionFilterCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AuctionFiltersProps {
  onFilterChange: (filters: AuctionFiltersType) => void;
}

export function AuctionFilters({ onFilterChange }: AuctionFiltersProps) {
  const [filters, setFilters] = useState<AuctionFiltersType>({});
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleFilterChange = (key: keyof AuctionFiltersType, value: any) => {
    // If clearing the make, also clear the model
    if (key === 'make' && !value) {
      setFilters(prev => ({ ...prev, [key]: value, model: undefined }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  
  const handleApplyFilters = () => {
    onFilterChange(filters);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // On mobile, display a button that opens a sheet with filters
  if (isMobile) {
    return (
      <div className="mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" /> Filtry
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] overflow-y-auto">
            <div className="py-4">
              <AuctionFilterCard
                filters={filters}
                onFilterChange={(partialFilters) => {
                  setFilters(prev => ({ ...prev, ...partialFilters }));
                }}
                handleApplyFilters={handleApplyFilters}
                handleClearFilters={handleClearFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  // On desktop, display filters normally
  return (
    <div className="mb-6">
      <AuctionFilterCard
        filters={filters}
        onFilterChange={(partialFilters) => {
          setFilters(prev => ({ ...prev, ...partialFilters }));
        }}
        handleApplyFilters={handleApplyFilters}
        handleClearFilters={handleClearFilters}
      />
    </div>
  );
}
