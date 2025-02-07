
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import CarForm from "@/components/admin/CarForm";
import CarCard from "@/components/admin/CarCard";
import { Car } from "@/types/car";

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
            <CarForm
              car={newCar}
              onSubmit={handleAddCar}
              onCancel={() => {
                setShowAddForm(false);
                setNewCar({});
              }}
              setCar={setNewCar}
            />
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            isEditing === car.id ? (
              <Card key={car.id} className="p-6">
                <CarForm
                  car={newCar}
                  onSubmit={() => handleEditCar(car.id)}
                  onCancel={() => {
                    setIsEditing(null);
                    setNewCar({});
                  }}
                  setCar={setNewCar}
                  isEditing
                />
              </Card>
            ) : (
              <CarCard
                key={car.id}
                car={car}
                onEdit={(id) => {
                  setIsEditing(id);
                  setNewCar(car);
                }}
                onDelete={handleDeleteCar}
              />
            )
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;

