
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Cars = () => {
  const cars = [
    { id: 1, brand: "Toyota", model: "Camry", year: 2020, price: "25000", status: "В наявності" },
    { id: 2, brand: "Honda", model: "Civic", year: 2021, price: "22000", status: "Продано" },
    { id: 3, brand: "BMW", model: "X5", year: 2019, price: "45000", status: "В наявності" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управління автомобілями</h1>
        <Button>
          <Plus className="mr-2" />
          Додати автомобіль
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Список автомобілів</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Марка</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Рік</TableHead>
                <TableHead>Ціна ($)</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.id}</TableCell>
                  <TableCell>{car.brand}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>{car.price}</TableCell>
                  <TableCell>{car.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cars;
