
import { Car } from "@/types/car";
import { Card } from "@/components/ui/card";
import CarForm from "./CarForm";

interface AdminCarFormProps {
  showForm: boolean;
  newCar: Partial<Car>;
  onSubmit: () => void;
  onCancel: () => void;
  setCar: (car: Partial<Car>) => void;
  isEditing?: boolean;
}

const AdminCarForm = ({ 
  showForm, 
  newCar, 
  onSubmit, 
  onCancel, 
  setCar, 
  isEditing 
}: AdminCarFormProps) => {
  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        {isEditing ? "Редагувати авто" : "Додати нове авто"}
      </h2>
      <CarForm
        car={newCar}
        onSubmit={onSubmit}
        onCancel={onCancel}
        setCar={setCar}
        isEditing={isEditing}
      />
    </Card>
  );
};

export default AdminCarForm;
