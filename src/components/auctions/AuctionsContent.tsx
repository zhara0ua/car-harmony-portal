
import React from "react";
import { AuctionCarCard } from "@/components/auctions/AuctionCarCard";
import { AuctionPagination } from "@/components/auctions/AuctionPagination";
import { AuctionCar } from "@/types/auction-car";

interface AuctionsContentProps {
  isLoading: boolean;
  currentCars: AuctionCar[] | undefined;
  totalCars: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AuctionsContent = ({
  isLoading,
  currentCars,
  totalCars,
  currentPage,
  totalPages,
  onPageChange
}: AuctionsContentProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }
  
  if (!currentCars?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Brak dostępnych aukcji
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCars.map((car) => (
          <AuctionCarCard key={car.id} car={car} />
        ))}
      </div>
      
      <AuctionPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Pokazano {currentCars.length} z {totalCars} aukcji
      </div>
    </>
  );
};
