
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { Car } from "../../types/car";
import { CarForm } from "../CarForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CarActionButtonsProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (carId: number) => Promise<void>;
  onSave: (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => Promise<void>;
  editingCar: Car | null;
}

export const CarActionButtons = ({ 
  car, 
  onEdit, 
  onDelete, 
  onSave, 
  editingCar 
}: CarActionButtonsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = () => {
    onEdit(car);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => {
    await onSave(e, imageFiles, mainImageIndex);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    console.log("Confirming delete for car:", car.id);
    await onDelete(car.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handleEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button size="sm" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
        <Trash className="h-4 w-4" />
      </Button>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редагувати автомобіль</DialogTitle>
          </DialogHeader>
          <CarForm car={car} onSubmit={handleSave} />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити автомобіль?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити {car.make} {car.model}? Цю дію не можна буде скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
