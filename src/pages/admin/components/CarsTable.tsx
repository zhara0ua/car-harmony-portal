
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Images } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CarForm } from "./CarForm";
import { Car } from "../types/car";
import { Badge } from "@/components/ui/badge";

interface CarsTableProps {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (carId: number) => Promise<void>;
  onSave: (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => Promise<void>;
  editingCar: Car | null;
}

export const CarsTable = ({ cars, onEdit, onDelete, onSave, editingCar }: CarsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Назва</TableHead>
          <TableHead>Марка</TableHead>
          <TableHead>Модель</TableHead>
          <TableHead>Рік</TableHead>
          <TableHead>Ціна</TableHead>
          <TableHead>Фото</TableHead>
          <TableHead>Дії</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cars.map((car) => (
          <TableRow key={car.id}>
            <TableCell>{car.id}</TableCell>
            <TableCell>{car.name}</TableCell>
            <TableCell>{car.make}</TableCell>
            <TableCell>{car.model}</TableCell>
            <TableCell>{car.year}</TableCell>
            <TableCell>{car.price}</TableCell>
            <TableCell>
              {car.images && car.images.length > 0 ? (
                <Badge variant="outline" className="flex items-center">
                  <Images className="h-3 w-3 mr-1" />
                  {car.images.length}
                </Badge>
              ) : (
                <Badge variant="outline">1</Badge>
              )}
            </TableCell>
            <TableCell className="space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => onEdit(car)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Редагувати автомобіль</DialogTitle>
                  </DialogHeader>
                  {editingCar && <CarForm car={editingCar} onSubmit={onSave} />}
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
                      Ця дія не може бути скасована. Автомобіль буде назавжди видалений з системи.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Скасувати</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(car.id)} className="bg-red-500 hover:bg-red-600">
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
  );
};
