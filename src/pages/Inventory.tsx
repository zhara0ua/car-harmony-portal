
import { useState } from "react";
import Navbar from "@/components/Navbar";
import CarCard from "@/components/CarCard";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

interface Car {
  image: string;
  name: string;
  price: string;
  year: number;
  mileage: string;
  category: "Седан" | "SUV" | "Купе" | "Універсал";
  transmission: "Автомат" | "Механіка";
  fuelType: "Бензин" | "Дизель" | "Гібрид" | "Електро";
  engineSize: string;
  enginePower: string;
}

const Inventory = () => {
  const [category, setCategory] = useState<string>("");
  const [transmission, setTransmission] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("");

  const cars: Car[] = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz S-Class",
      price: "85.000 zł",
      year: 2023,
      mileage: "24.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "3.0л",
      enginePower: "435 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
      name: "BMW 7 Series",
      price: "78.500 zł",
      year: 2022,
      mileage: "35.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Гібрид",
      engineSize: "3.0л",
      enginePower: "389 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      name: "Audi A8",
      price: "82.000 zł",
      year: 2023,
      mileage: "29.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Дизель",
      engineSize: "3.0л",
      enginePower: "340 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80",
      name: "Porsche Panamera",
      price: "125.000 zł",
      year: 2023,
      mileage: "15.000 km",
      category: "Купе",
      transmission: "Автомат",
      fuelType: "Гібрид",
      engineSize: "4.0л",
      enginePower: "680 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80",
      name: "BMW X7",
      price: "92.000 zł",
      year: 2022,
      mileage: "31.000 km",
      category: "SUV",
      transmission: "Автомат",
      fuelType: "Дизель",
      engineSize: "3.0л",
      enginePower: "340 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz G-Class",
      price: "138.000 zł",
      year: 2023,
      mileage: "18.000 km",
      category: "SUV",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "585 к.с."
    }
  ];

  const filteredCars = cars.filter(car => {
    if (category && car.category !== category) return false;
    if (transmission && car.transmission !== transmission) return false;
    if (fuelType && car.fuelType !== fuelType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-navy mb-8">Наші Автомобілі</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Select onValueChange={(value) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Тип кузова" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              <SelectItem value="Седан">Седан</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Купе">Купе</SelectItem>
              <SelectItem value="Універсал">Універсал</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setTransmission(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Коробка передач" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              <SelectItem value="Автомат">Автомат</SelectItem>
              <SelectItem value="Механіка">Механіка</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setFuelType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Тип палива" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              <SelectItem value="Бензин">Бензин</SelectItem>
              <SelectItem value="Дизель">Дизель</SelectItem>
              <SelectItem value="Гібрид">Гібрид</SelectItem>
              <SelectItem value="Електро">Електро</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car, index) => (
            <CarCard key={index} {...car} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
