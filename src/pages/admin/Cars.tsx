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

const Cars = () => {
  const [cars, setCars] = useState([
    { id: 1, brand: "Toyota", model: "Camry", year: 2020, price: "25000", status: "В наявності" },
    { id: 2, brand: "Honda", model: "Civic", year: 2021, price: "22000", status: "Продано" },
    { id: 3, brand: "BMW", model: "X5", year: 2019, price: "45000", status: "В наявності" },
  ]);

  const [editingCar, setEditingCar] = useState(null);

  const handleEdit = (car) => {
    setEditingCar(car);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedCar = {
      ...editingCar,
      brand: form.brand.value,
      model: form.model.value,
      year: parseInt(form.year.value),
      price: form.price.value,
      status: form.status.value,
    };

    setCars(cars.map(car => car.id === updatedCar.id ? updatedCar : car));
    setEditingCar(null);
  };

  const handleDelete = (carId) => {
    setCars(cars.filter(car => car.id !== carId));
  };

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
                <TableHead>Дії</TableHead>
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
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(car)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редагувати автомобіль</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="brand">Марка</Label>
                            <Input id="brand" defaultValue={car.brand} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="model">Модель</Label>
                            <Input id="model" defaultValue={car.model} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="year">Рік</Label>
                            <Input id="year" type="number" defaultValue={car.year} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Ціна ($)</Label>
                            <Input id="price" defaultValue={car.price} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Статус</Label>
                            <Input id="status" defaultValue={car.status} />
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
                          <AlertDialogTitle>Видалити автомобіль?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ця дія не може бути скасована. Автомобіль буде назавжди видалений з с��стеми.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(car.id)} className="bg-red-500 hover:bg-red-600">
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

export default Cars;
