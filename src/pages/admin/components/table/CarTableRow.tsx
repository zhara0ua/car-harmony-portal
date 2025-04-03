
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Images } from "lucide-react";
import { Car } from "../../types/car";
import { CarActionButtons } from "./CarActionButtons";

interface CarTableRowProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (carId: number) => Promise<void>;
  onSave: (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => Promise<void>;
  editingCar: Car | null;
}

export const CarTableRow = ({ car, onEdit, onDelete, onSave, editingCar }: CarTableRowProps) => {
  return (
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
      <TableCell>
        <CarActionButtons 
          car={car} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onSave={onSave} 
          editingCar={editingCar} 
        />
      </TableCell>
    </TableRow>
  );
};
