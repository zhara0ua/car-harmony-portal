import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2 } from "lucide-react";

interface Car {
  id: string;
  name: string;
  make: string;
  model: string;
  price: number;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  image_url: string;
}

interface CarFormData {
  name: string;
  make: string;
  model: string;
  price: number;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  image_url: string;
}

const Cars = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    make: "",
    model: "",
    price: 0,
    year: new Date().getFullYear(),
    mileage: "",
    category: "",
    transmission: "",
    fuel_type: "",
    engine_size: "",
    engine_power: "",
    image_url: "",
  });

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Car[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCar: CarFormData) => {
      const { data, error } = await supabase.from("cars").insert([newCar]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({ title: "Автомобіль успішно додано" });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Помилка при додаванні автомобіля",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (car: Car) => {
      const { data, error } = await supabase
        .from("cars")
        .update(car)
        .eq("id", car.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({ title: "Автомобіль успішно оновлено" });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Помилка при оновленні автомобіля",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({ title: "Автомобіль успішно видалено" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Помилка при видаленні автомобіля",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCar) {
      updateMutation.mutate({ ...formData, id: editingCar.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData(car);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей автомобіль?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      make: "",
      model: "",
      price: 0,
      year: new Date().getFullYear(),
      mileage: "",
      category: "",
      transmission: "",
      fuel_type: "",
      engine_size: "",
      engine_power: "",
      image_url: "",
    });
    setEditingCar(null);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управління автомобілями</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Додати автомобіль</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCar ? "Редагувати автомобіль" : "Додати новий автомобіль"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Марка</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Модель</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Ціна</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Рік</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Пробіг</Label>
                  <Input
                    id="mileage"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категорія</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Трансмісія</Label>
                  <Input
                    id="transmission"
                    value={formData.transmission}
                    onChange={(e) =>
                      setFormData({ ...formData, transmission: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Тип палива</Label>
                  <Input
                    id="fuel_type"
                    value={formData.fuel_type}
                    onChange={(e) =>
                      setFormData({ ...formData, fuel_type: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engine_size">Об'єм двигуна</Label>
                  <Input
                    id="engine_size"
                    value={formData.engine_size}
                    onChange={(e) =>
                      setFormData({ ...formData, engine_size: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engine_power">Потужність</Label>
                  <Input
                    id="engine_power"
                    value={formData.engine_power}
                    onChange={(e) =>
                      setFormData({ ...formData, engine_power: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL зображення</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingCar ? "Оновити" : "Додати"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Завантаження...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Марка</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Ціна</TableHead>
                <TableHead>Рік</TableHead>
                <TableHead>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars?.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.name}</TableCell>
                  <TableCell>{car.make}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.price}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(car)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(car.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
};

export default Cars;