
import { Car } from "@/types/car";
import { Card } from "@/components/ui/card";
import CarCard from "./CarCard";
import CarForm from "./CarForm";

interface CarsGridProps {
  cars: Car[];
  isEditing: string | null;
  newCar: Partial<Car>;
  onEdit: (id: string) => void;
  onEditSubmit: (id: string) => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
  setCar: (car: Partial<Car>) => void;
}

const CarsGrid = ({
  cars,
  isEditing,
  newCar,
  onEdit,
  onEditSubmit,
  onEditCancel,
  onDelete,
  setCar
}: CarsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cars.map((car) => (
        isEditing === car.id ? (
          <Card key={car.id} className="p-6">
            <CarForm
              car={newCar}
              onSubmit={() => onEditSubmit(car.id)}
              onCancel={onEditCancel}
              setCar={setCar}
              isEditing
            />
          </Card>
        ) : (
          <CarCard
            key={car.id}
            car={car}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      ))}
    </div>
  );
};

export default CarsGrid;
