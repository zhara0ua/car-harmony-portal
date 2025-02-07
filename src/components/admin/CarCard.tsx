
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

interface CarCardProps {
  car: Car;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CarCard = ({ car, onEdit, onDelete }: CarCardProps) => {
  return (
    <Card className="p-4">
      <img src={car.image} alt={car.name} className="w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
      <p className="text-2xl font-bold text-navy mb-4">{car.price}</p>
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

export default CarCard;

