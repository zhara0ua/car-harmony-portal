
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminCarForm from "@/components/admin/AdminCarForm";
import CarsGrid from "@/components/admin/CarsGrid";
import { Car } from "@/types/car";

const AdminPanel = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    category: "Седан",
    transmission: "Автомат",
    fuelType: "Бензин",
    images: []
  });

  const handleAddCar = () => {
    if (!newCar.name || !newCar.price || !newCar.images?.length) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі обов'язкові поля та додайте хоча б одне зображення",
        variant: "destructive"
      });
      return;
    }

    const carToAdd: Car = {
      id: Date.now().toString(),
      images: newCar.images || [],
      image: newCar.images[0] || "",
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
      enginePower: newCar.enginePower || "",
      description: newCar.description || ""
    };

    setCars([...cars, carToAdd]);
    setNewCar({
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Бензин",
      images: []
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
        return { 
          ...car, 
          ...newCar,
          image: newCar.images?.[0] || car.image 
        };
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
        <AdminHeader onAddCar={() => setShowAddForm(true)} />

        <AdminCarForm
          showForm={showAddForm}
          newCar={newCar}
          onSubmit={handleAddCar}
          onCancel={() => {
            setShowAddForm(false);
            setNewCar({});
          }}
          setCar={setNewCar}
        />

        <CarsGrid
          cars={cars}
          isEditing={isEditing}
          newCar={newCar}
          onEdit={(id) => {
            setIsEditing(id);
            setNewCar(cars.find(car => car.id === id) || {});
          }}
          onEditSubmit={handleEditCar}
          onEditCancel={() => {
            setIsEditing(null);
            setNewCar({});
          }}
          onDelete={handleDeleteCar}
          setCar={setNewCar}
        />
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
