
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Car {
  id: number;
  name: string;
  make: string;
  model: string;
  price: string;
  price_number: number;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  image: string;
}

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

    const newCar = {
      name: formData.get('name') as string,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      price: formData.get('price') as string,
      price_number: parseInt(formData.get('price_number') as string),
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

    const updatedCar = {
      name: formData.get('name') as string,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      price: formData.get('price') as string,
      price_number: parseInt(formData.get('price_number') as string),
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

  const CarForm = ({ car, onSubmit }: { car?: Car; onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Назва</Label>
        <Input id="name" name="name" defaultValue={car?.name} required />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Марка</Label>
          <Input id="make" name="make" defaultValue={car?.make} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Модель</Label>
          <Input id="model" name="model" defaultValue={car?.model} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Ціна ($)</Label>
          <Input id="price" name="price" defaultValue={car?.price} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_number">Ціна (число)</Label>
          <Input id="price_number" name="price_number" type="number" defaultValue={car?.price_number} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Рік</Label>
          <Input id="year" name="year" type="number" defaultValue={car?.year} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mileage">Пробіг</Label>
          <Input id="mileage" name="mileage" defaultValue={car?.mileage} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Тип кузова</Label>
        <Select name="category" defaultValue={car?.category || "Седан"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип кузова" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Седан">Седан</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="Купе">Купе</SelectItem>
            <SelectItem value="Універсал">Універсал</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transmission">Коробка передач</Label>
        <Select name="transmission" defaultValue={car?.transmission || "Автомат"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип КПП" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Автомат">Автомат</SelectItem>
            <SelectItem value="Механіка">Механіка</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fuel_type">Тип палива</Label>
        <Select name="fuel_type" defaultValue={car?.fuel_type || "Бензин"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть тип палива" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Бензин">Бензин</SelectItem>
            <SelectItem value="Дизель">Дизель</SelectItem>
            <SelectItem value="Гібрид">Гібрид</SelectItem>
            <SelectItem value="Електро">Електро</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="engine_size">Об'єм двигуна</Label>
          <Input id="engine_size" name="engine_size" defaultValue={car?.engine_size} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="engine_power">Потужність</Label>
          <Input id="engine_power" name="engine_power" defaultValue={car?.engine_power} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">URL зображення</Label>
        <Input id="image" name="image" defaultValue={car?.image} required />
      </div>

      <Button type="submit">{car ? "Зберегти" : "Додати"}</Button>
    </form>
  );

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead>Марка</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Рік</TableHead>
                <TableHead>Ціна ($)</TableHead>
                <TableHead>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.id}</TableCell>
                  <TableCell>{car.name}</TableCell>
                  <TableCell>{car.make}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>{car.price}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(car)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Редагувати автомобіль</DialogTitle>
                        </DialogHeader>
                        {editingCar && <CarForm car={editingCar} onSubmit={handleSave} />}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Видалити автомобіль?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ця дія не може бути скасована. Автомобіль буде назавжди видалений з системи.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(car.id)} className="bg-red-500 hover:bg-red-600">
                            Видалити
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cars;
