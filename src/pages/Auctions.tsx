
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuctionFilters } from "@/components/auctions/AuctionFilters";
import { AuctionSorting } from "@/components/auctions/AuctionSorting";
import { AuctionsContent } from "@/components/auctions/AuctionsContent";
import { AuctionErrorDialog } from "@/components/auctions/AuctionErrorDialog";
import { useAuctionFiltering } from "@/hooks/useAuctionFiltering";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Auctions() {
  const { 
    filters,
    currentCars,
    currentPage,
    totalCars,
    totalPages,
    isLoading,
    sortField,
    sortOrder,
    isErrorDialogOpen,
    errorMessage,
    setIsErrorDialogOpen,
    handleFilterChange,
    handleSort,
    handlePageChange
  } = useAuctionFiltering();

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row justify-between items-center'}`}>
            <h1 className="text-2xl sm:text-3xl font-bold">Aukcje samochodów</h1>
            
            <AuctionSorting 
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>

          <AuctionFilters onFilterChange={handleFilterChange} />

          <AuctionsContent 
            isLoading={isLoading}
            currentCars={currentCars}
            totalCars={totalCars}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      <Footer />

      <AuctionErrorDialog 
        isOpen={isErrorDialogOpen}
        errorMessage={errorMessage}
        onClose={() => setIsErrorDialogOpen(false)}
      />
    </div>
  );
}
