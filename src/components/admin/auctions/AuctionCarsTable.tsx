
import React from "react";
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

interface AuctionCarsTableProps {
  cars: AuctionCar[] | null;
}

export const AuctionCarsTable = ({ cars }: AuctionCarsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista samochodów ({cars?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {cars?.length ? (
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
                {cars.map((car) => (
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
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            Brak samochodów w bazie danych
          </div>
        )}
      </CardContent>
    </Card>
  );
};
