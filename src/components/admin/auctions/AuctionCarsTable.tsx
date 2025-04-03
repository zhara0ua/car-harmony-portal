
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AuctionCar } from "@/types/auction-car";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface AuctionCarsTableProps {
  cars: AuctionCar[] | null;
}

export const AuctionCarsTable = ({ cars }: AuctionCarsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 20;

  // Calculate pagination
  const totalCars = cars?.length || 0;
  const totalPages = Math.ceil(totalCars / carsPerPage);
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars?.slice(indexOfFirstCar, indexOfLastCar) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista samochodów ({totalCars})</CardTitle>
      </CardHeader>
      <CardContent>
        {cars?.length ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Rok</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead>Data zakończenia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.external_id}</TableCell>
                      <TableCell>{car.title}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.start_price} zł</TableCell>
                      <TableCell>{new Date(car.end_date).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => {
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
                              onClick={() => setCurrentPage(number)}
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
                        <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            <div className="mt-2 text-center text-sm text-muted-foreground">
              Wyświetlono {indexOfFirstCar + 1}-{Math.min(indexOfLastCar, totalCars)} z {totalCars} samochodów
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            Brak samochodów w bazie danych
          </div>
        )}
      </CardContent>
    </Card>
  );
};
