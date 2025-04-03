
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface AuctionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AuctionPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: AuctionPaginationProps) => {
  if (totalPages <= 1) return null;

  // Generate page numbers for pagination
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
            </PaginationItem>
          )}
          
          {pageNumbers.map(number => {
            // Show current page, first, last, and 1 page before and after current page
            if (
              number === 1 || 
              number === totalPages || 
              (number >= currentPage - 1 && number <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={number}>
                  <PaginationLink 
                    isActive={number === currentPage}
                    onClick={() => onPageChange(number)}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (
              (number === 2 && currentPage > 3) || 
              (number === totalPages - 1 && currentPage < totalPages - 2)
            ) {
              return (
                <PaginationItem key={number}>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              );
            }
            return null;
          })}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};
