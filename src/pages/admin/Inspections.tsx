
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

const Inspections = () => {
  const inspections = [
    { id: 1, car: "Toyota Camry", client: "Іван Петров", date: "2024-03-15", status: "Заплановано" },
    { id: 2, car: "Honda Civic", client: "Марія Коваль", date: "2024-03-14", status: "Завершено" },
    { id: 3, car: "BMW X5", client: "Петро Сидоренко", date: "2024-03-13", status: "В процесі" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управління інспекціями</h1>
        <Button>
          <Plus className="mr-2" />
          Створити інспекцію
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Список інспекцій</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Автомобіль</TableHead>
                <TableHead>Клієнт</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell>{inspection.id}</TableCell>
                  <TableCell>{inspection.car}</TableCell>
                  <TableCell>{inspection.client}</TableCell>
                  <TableCell>{inspection.date}</TableCell>
                  <TableCell>{inspection.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inspections;
