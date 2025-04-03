
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Car } from "./types/car";
import { CarForm } from "./components/CarForm";
import { CarsTable } from "./components/CarsTable";
import { fetchCars, createCar, updateCar, deleteCar } from "./utils/carUtils";

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const loadCars = async () => {
    const data = await fetchCars();
    setCars(data);
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => {
    e.preventDefault();
    const success = await createCar(new FormData(e.target as HTMLFormElement), imageFiles, mainImageIndex);
    if (success) {
      setIsAddDialogOpen(false);
      loadCars();
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => {
    e.preventDefault();
    if (!editingCar) return;

    const success = await updateCar(new FormData(e.target as HTMLFormElement), editingCar.id, imageFiles, mainImageIndex);
    if (success) {
      setEditingCar(null);
      loadCars();
    }
  };

  const handleDelete = async (carId: number) => {
    const success = await deleteCar(carId);
    if (success) {
      loadCars();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управління автомобілями</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" />
              Додати автомобіль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Додати автомобіль</DialogTitle>
            </DialogHeader>
            <CarForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список автомобілів</CardTitle>
        </CardHeader>
        <CardContent>
          <CarsTable 
            cars={cars}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSave}
            editingCar={editingCar}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Cars;
