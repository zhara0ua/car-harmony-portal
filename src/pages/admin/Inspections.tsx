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
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Inspections = () => {
  const [inspections, setInspections] = useState([
    { id: 1, car: "Toyota Camry", client: "Іван Петров", date: "2024-03-15", status: "Заплановано" },
    { id: 2, car: "Honda Civic", client: "Марія Коваль", date: "2024-03-14", status: "Завершено" },
    { id: 3, car: "BMW X5", client: "Петро Сидоренко", date: "2024-03-13", status: "В процесі" },
  ]);

  const [editingInspection, setEditingInspection] = useState(null);

  const handleEdit = (inspection) => {
    setEditingInspection(inspection);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedInspection = {
      ...editingInspection,
      car: form.car.value,
      client: form.client.value,
      date: form.date.value,
      status: form.status.value,
    };

    setInspections(inspections.map(inspection => 
      inspection.id === updatedInspection.id ? updatedInspection : inspection
    ));
    setEditingInspection(null);
  };

  const handleDelete = (inspectionId) => {
    setInspections(inspections.filter(inspection => inspection.id !== inspectionId));
  };

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
                <TableHead>Дії</TableHead>
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
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(inspection)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редагувати інспекцію</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="car">Авто��обіль</Label>
                            <Input id="car" defaultValue={inspection.car} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="client">Клієнт</Label>
                            <Input id="client" defaultValue={inspection.client} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date">Дата</Label>
                            <Input id="date" type="date" defaultValue={inspection.date} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Статус</Label>
                            <Input id="status" defaultValue={inspection.status} />
                          </div>
                          <Button type="submit">Зберегти</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Видалити інспекцію?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ця дія не може бути скасована. Інспекція буде назавжди видалена з системи.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(inspection.id)} className="bg-red-500 hover:bg-red-600">
                            Видалити
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
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
