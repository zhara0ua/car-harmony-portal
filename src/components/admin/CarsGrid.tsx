
import { Car } from "@/types/car";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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

const CarCard = ({ car, onEdit, onDelete }: { 
  car: Car; 
  onEdit: (id: string) => void; 
  onDelete: (id: string) => void; 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev + 1 >= car.images.length ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev - 1 < 0 ? car.images.length - 1 : prev - 1
    );
  };

  return (
    <Card className="p-4">
      <div className="relative">
        <img 
          src={car.images[currentImageIndex]} 
          alt={car.name} 
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        {car.images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
      <p className="text-2xl font-bold text-navy mb-2">{car.price}</p>
      {car.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">{car.description}</p>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onEdit(car.id)}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Редагувати
        </Button>
        <Button
          variant="destructive"
          onClick={() => onDelete(car.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Видалити
        </Button>
      </div>
    </Card>
  );
};

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
