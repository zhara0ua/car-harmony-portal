
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car } from "./types/car";
import { CarForm } from "./components/CarForm";
import { CarsTable } from "./components/CarsTable";

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити список автомобілів",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceNumber = parseInt(formData.get('price') as string);

    const newCar = {
      name: `${make} ${model}`,
      make: make,
      model: model,
      price: `${priceNumber.toLocaleString()} zł`,
      price_number: priceNumber,
      year: parseInt(formData.get('year') as string),
      mileage: formData.get('mileage') as string,
      category: formData.get('category') as string,
      transmission: formData.get('transmission') as string,
      fuel_type: formData.get('fuel_type') as string,
      engine_size: formData.get('engine_size') as string,
      engine_power: formData.get('engine_power') as string,
      image: formData.get('image') as string,
    };

    try {
      const { error } = await supabase
        .from('cars')
        .insert(newCar);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Автомобіль додано",
      });
      
      setIsAddDialogOpen(false);
      fetchCars();
      form.reset();
    } catch (error) {
      console.error('Error adding car:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося додати автомобіль",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCar) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const make = formData.get('make') as string;
    const model = formData.get('model') as string;
    const priceNumber = parseInt(formData.get('price') as string);

    const updatedCar = {
      name: `${make} ${model}`,
      make: make,
      model: model,
      price: `${priceNumber.toLocaleString()} zł`,
      price_number: priceNumber,
      year: parseInt(formData.get('year') as string),
      mileage: formData.get('mileage') as string,
      category: formData.get('category') as string,
      transmission: formData.get('transmission') as string,
      fuel_type: formData.get('fuel_type') as string,
      engine_size: formData.get('engine_size') as string,
      engine_power: formData.get('engine_power') as string,
      image: formData.get('image') as string,
    };

    try {
      const { error } = await supabase
        .from('cars')
        .update(updatedCar)
        .eq('id', editingCar.id);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Дані автомобіля оновлено",
      });

      setEditingCar(null);
      fetchCars();
    } catch (error) {
      console.error('Error updating car:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося оновити дані автомобіля",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (carId: number) => {
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Автомобіль видалено",
      });

      fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося видалити автомобіль",
        variant: "destructive",
      });
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
          <DialogContent className="max-w-2xl">
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
