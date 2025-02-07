
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Car {
  id: string;
  image: string;
  name: string;
  make: string;
  model: string;
  price: string;
  priceNumber: number;
  year: number;
  mileage: string;
  category: "Седан" | "SUV" | "Купе" | "Універсал";
  transmission: "Автомат" | "Механіка";
  fuelType: "Бензин" | "Дизель" | "Гібрид" | "Електро";
  engineSize: string;
  enginePower: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    category: "Седан",
    transmission: "Автомат",
    fuelType: "Бензин"
  });

  const handleAddCar = () => {
    if (!newCar.name || !newCar.price || !newCar.image) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі обов'язкові поля",
        variant: "destructive"
      });
      return;
    }

    const carToAdd: Car = {
      id: Date.now().toString(),
      image: newCar.image || "",
      name: newCar.name || "",
      make: newCar.make || "",
      model: newCar.model || "",
      price: newCar.price || "",
      priceNumber: parseInt(newCar.price?.replace(/[^0-9]/g, "") || "0"),
      year: newCar.year || new Date().getFullYear(),
      mileage: newCar.mileage || "",
      category: newCar.category || "Седан",
      transmission: newCar.transmission || "Автомат",
      fuelType: newCar.fuelType || "Бензин",
      engineSize: newCar.engineSize || "",
      enginePower: newCar.enginePower || ""
    };

    setCars([...cars, carToAdd]);
    setNewCar({
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Бензин"
    });
    setShowAddForm(false);
    toast({
      title: "Успішно",
      description: "Автомобіль додано"
    });
  };

  const handleEditCar = (carId: string) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        return { ...car, ...newCar };
      }
      return car;
    });
    setCars(updatedCars);
    setIsEditing(null);
    setNewCar({});
    toast({
      title: "Успішно",
      description: "Дані автомобіля оновлено"
    });
  };

  const handleDeleteCar = (carId: string) => {
    setCars(cars.filter(car => car.id !== carId));
    toast({
      title: "Успішно",
      description: "Автомобіль видалено"
    });
  };

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-navy">Адмін Панель</h1>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-navy hover:bg-navy/90 text-white rounded-full"
          >
            <Plus className="mr-2" /> Додати авто
          </Button>
        </div>

        {showAddForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Додати нове авто</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Назва</Label>
                <Input
                  value={newCar.name || ""}
                  onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  placeholder="Mercedes-Benz S-Class"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Марка</Label>
                <Input
                  value={newCar.make || ""}
                  onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                  placeholder="Mercedes-Benz"
                />
              </div>

              <div className="space-y-2">
                <Label>Модель</Label>
                <Input
                  value={newCar.model || ""}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                  placeholder="S-Class"
                />
              </div>

              <div className="space-y-2">
                <Label>Зображення (URL)</Label>
                <Input
                  value={newCar.image || ""}
                  onChange={(e) => setNewCar({ ...newCar, image: e.target.value })}
                  placeholder="https://example.com/car-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Ціна</Label>
                <Input
                  value={newCar.price || ""}
                  onChange={(e) => setNewCar({ ...newCar, price: e.target.value })}
                  placeholder="85.000 zł"
                />
              </div>

              <div className="space-y-2">
                <Label>Рік</Label>
                <Input
                  type="number"
                  value={newCar.year || ""}
                  onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                  placeholder="2023"
                />
              </div>

              <div className="space-y-2">
                <Label>Пробіг</Label>
                <Input
                  value={newCar.mileage || ""}
                  onChange={(e) => setNewCar({ ...newCar, mileage: e.target.value })}
                  placeholder="24.000 km"
                />
              </div>

              <div className="space-y-2">
                <Label>Тип кузова</Label>
                <Select
                  value={newCar.category}
                  onValueChange={(value: "Седан" | "SUV" | "Купе" | "Універсал") => 
                    setNewCar({ ...newCar, category: value })
                  }
                >
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
                <Label>Коробка передач</Label>
                <Select
                  value={newCar.transmission}
                  onValueChange={(value: "Автомат" | "Механіка") => 
                    setNewCar({ ...newCar, transmission: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть коробку передач" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Автомат">Автомат</SelectItem>
                    <SelectItem value="Механіка">Механіка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Тип палива</Label>
                <Select
                  value={newCar.fuelType}
                  onValueChange={(value: "Бензин" | "Дизель" | "Гібрид" | "Електро") => 
                    setNewCar({ ...newCar, fuelType: value })
                  }
                >
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

              <div className="space-y-2">
                <Label>Об'єм двигуна</Label>
                <Input
                  value={newCar.engineSize || ""}
                  onChange={(e) => setNewCar({ ...newCar, engineSize: e.target.value })}
                  placeholder="3.0л"
                />
              </div>

              <div className="space-y-2">
                <Label>Потужність</Label>
                <Input
                  value={newCar.enginePower || ""}
                  onChange={(e) => setNewCar({ ...newCar, enginePower: e.target.value })}
                  placeholder="435 к.с."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleAddCar}
                className="bg-navy hover:bg-navy/90 text-white"
              >
                Зберегти
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewCar({});
                }}
              >
                Скасувати
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <Card key={car.id} className="p-4">
              {isEditing === car.id ? (
                <div className="space-y-4">
                  <Input
                    value={newCar.name || car.name}
                    onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  />
                  <Input
                    value={newCar.price || car.price}
                    onChange={(e) => setNewCar({ ...newCar, price: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditCar(car.id)}
                      className="bg-navy hover:bg-navy/90 text-white"
                    >
                      Зберегти
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(null);
                        setNewCar({});
                      }}
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <img src={car.image} alt={car.name} className="w-full h-48 object-cover rounded-md mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                  <p className="text-2xl font-bold text-navy mb-4">{car.price}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(car.id);
                        setNewCar(car);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Редагувати
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCar(car.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Видалити
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
