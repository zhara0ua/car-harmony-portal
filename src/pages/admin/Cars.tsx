
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
import { fetchCars } from "./utils/carFetchUtils";
import { createCar } from "./utils/carCreateUtils";
import { updateCar } from "./utils/carUpdateUtils";
import { deleteCar } from "./utils/carDeleteUtils";
import { toast } from "@/hooks/use-toast";

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    console.log("Cars component - Authentication status:", isAuthenticated);
    
    if (!isAuthenticated) {
      toast({
        title: "Помилка авторизації",
        description: "Ви не авторизовані. Будь ласка, увійдіть у систему.",
        variant: "destructive",
      });
      return;
    }
    
    loadCars();
  }, []);

  const loadCars = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCars();
      console.log("Loaded cars data:", data);
      setCars(data);
    } catch (error) {
      console.error("Error loading cars:", error);
      toast({
        title: "Помилка завантаження",
        description: "Не вдалося завантажити список автомобілів",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    console.log("Adding car with formData:", Object.fromEntries(formData));
    console.log("Image files:", imageFiles.map(f => f.name));
    console.log("Main image index:", mainImageIndex);
    
    const success = await createCar(formData, imageFiles, mainImageIndex);
    if (success) {
      setIsAddDialogOpen(false);
      loadCars();
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEdit = (car: Car) => {
    console.log("Editing car:", car);
    setEditingCar(car);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, imageFiles: File[], mainImageIndex: number) => {
    e.preventDefault();
    if (!editingCar) {
      console.error("No car selected for editing");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    console.log("Saving car with ID:", editingCar.id, "FormData:", Object.fromEntries(formData));
    console.log("Image files:", imageFiles.map(f => f.name));
    console.log("Main image index:", mainImageIndex);
    
    const success = await updateCar(formData, editingCar.id, imageFiles, mainImageIndex);
    if (success) {
      setEditingCar(null);
      loadCars();
    }
  };

  const handleDelete = async (carId: number) => {
    console.log("Deleting car with ID:", carId);
    const success = await deleteCar(carId);
    if (success) {
      loadCars();
    }
  };

  // Check if authenticated status is present
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-4">
              Ви не авторизовані. Перейдіть на сторінку <a href="/admin/login" className="text-blue-500 underline">авторизації</a>.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {isLoading ? (
            <div className="text-center py-4">Завантаження...</div>
          ) : cars.length > 0 ? (
            <CarsTable 
              cars={cars}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSave={handleSave}
              editingCar={editingCar}
            />
          ) : (
            <div className="text-center py-4">Немає доступних автомобілів</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cars;
