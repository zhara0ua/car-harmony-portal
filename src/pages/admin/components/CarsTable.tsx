
import { Table, TableBody } from "@/components/ui/table";
import { Car } from "../types/car";
import { CarTableHeader } from "./table/CarTableHeader";
import { CarTableRow } from "./table/CarTableRow";

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
      <CarTableHeader />
      <TableBody>
        {cars.map((car) => (
          <CarTableRow 
            key={car.id}
            car={car} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onSave={onSave} 
            editingCar={editingCar} 
          />
        ))}
      </TableBody>
    </Table>
  );
};
