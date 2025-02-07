import { useState } from "react";
import Navbar from "@/components/Navbar";
import CarCard from "@/components/CarCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

const Inventory = () => {
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>("all");
  const [make, setMake] = useState<string>("all");
  const [model, setModel] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");

  const cars: Car[] = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
      name: "Mercedes-Benz S-Class",
      make: "Mercedes-Benz",
      model: "S-Class",
      price: "85.000 zł",
      priceNumber: 85000,
      year: 2023,
      mileage: "24.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "3.0л",
      enginePower: "435 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      name: "BMW 7 Series",
      make: "BMW",
      model: "7 Series",
      price: "78.500 zł",
      priceNumber: 78500,
      year: 2022,
      mileage: "35.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Гібрид",
      engineSize: "3.0л",
      enginePower: "389 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e",
      name: "Audi A8",
      make: "Audi",
      model: "A8",
      price: "82.000 zł",
      priceNumber: 82000,
      year: 2023,
      mileage: "29.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Дизель",
      engineSize: "3.0л",
      enginePower: "340 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d",
      name: "Porsche Panamera",
      make: "Porsche",
      model: "Panamera",
      price: "125.000 zł",
      priceNumber: 125000,
      year: 2023,
      mileage: "15.000 km",
      category: "Купе",
      transmission: "Автомат",
      fuelType: "Гібрид",
      engineSize: "4.0л",
      enginePower: "680 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c",
      name: "BMW X7",
      make: "BMW",
      model: "X7",
      price: "92.000 zł",
      priceNumber: 92000,
      year: 2022,
      mileage: "31.000 km",
      category: "SUV",
      transmission: "Автомат",
      fuelType: "Дизель",
      engineSize: "3.0л",
      enginePower: "340 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed",
      name: "Mercedes-Benz G-Class",
      make: "Mercedes-Benz",
      model: "G-Class",
      price: "138.000 zł",
      priceNumber: 138000,
      year: 2023,
      mileage: "18.000 km",
      category: "SUV",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "585 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
      name: "BMW M5",
      make: "BMW",
      model: "M5",
      price: "95.000 zł",
      priceNumber: 95000,
      year: 2022,
      mileage: "28.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.4л",
      enginePower: "625 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b",
      name: "Porsche 911",
      make: "Porsche",
      model: "911",
      price: "165.000 zł",
      priceNumber: 165000,
      year: 2023,
      mileage: "12.000 km",
      category: "Купе",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "3.0л",
      enginePower: "450 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a",
      name: "Audi RS6",
      make: "Audi",
      model: "RS6",
      price: "145.000 zł",
      priceNumber: 145000,
      year: 2022,
      mileage: "22.000 km",
      category: "Універсал",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "600 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
      name: "Mercedes-AMG GT",
      make: "Mercedes-Benz",
      model: "AMG GT",
      price: "175.000 zł",
      priceNumber: 175000,
      year: 2023,
      mileage: "8.000 km",
      category: "Купе",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "585 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5",
      name: "Porsche Cayenne",
      make: "Porsche",
      model: "Cayenne",
      price: "115.000 zł",
      priceNumber: 115000,
      year: 2022,
      mileage: "32.000 km",
      category: "SUV",
      transmission: "Автомат",
      fuelType: "Гібрид",
      engineSize: "3.0л",
      enginePower: "462 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
      name: "Audi RS Q8",
      make: "Audi",
      model: "RS Q8",
      price: "155.000 zł",
      priceNumber: 155000,
      year: 2023,
      mileage: "18.000 km",
      category: "SUV",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "600 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a",
      name: "BMW M8",
      make: "BMW",
      model: "M8",
      price: "168.000 zł",
      priceNumber: 168000,
      year: 2023,
      mileage: "15.000 km",
      category: "Купе",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.4л",
      enginePower: "625 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
      name: "Mercedes-AMG E63",
      make: "Mercedes-Benz",
      model: "E63",
      price: "135.000 zł",
      priceNumber: 135000,
      year: 2022,
      mileage: "25.000 km",
      category: "Седан",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "612 к.с."
    },
    {
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a",
      name: "Audi RS7",
      make: "Audi",
      model: "RS7",
      price: "148.000 zł",
      priceNumber: 148000,
      year: 2023,
      mileage: "20.000 km",
      category: "Купе",
      transmission: "Автомат",
      fuelType: "Бензин",
      engineSize: "4.0л",
      enginePower: "600 к.с."
    }
  ];

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make)));
  const uniqueModels = Array.from(new Set(cars.filter(car => make === "all" || car.make === make).map(car => car.model)));

  const filteredCars = cars
    .filter(car => {
      if (category !== "all" && car.category !== category) return false;
      if (transmission !== "all" && car.transmission !== transmission) return false;
      if (fuelType !== "all" && car.fuelType !== fuelType) return false;
      if (make !== "all" && car.make !== make) return false;
      if (model !== "all" && car.model !== model) return false;
      if (minPrice && car.priceNumber < parseInt(minPrice)) return false;
      if (maxPrice && car.priceNumber > parseInt(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.priceNumber - b.priceNumber;
        case "price-desc":
          return b.priceNumber - a.priceNumber;
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-navy mb-8">Наші Автомобілі</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <Label>Марка</Label>
            <Select value={make} onValueChange={(value) => setMake(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Виберіть марку" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі марки</SelectItem>
                {uniqueMakes.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Модель</Label>
            <Select value={model} onValueChange={(value) => setModel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Виберіть модель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі моделі</SelectItem>
                {uniqueModels.map((model) => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ціна від</Label>
            <Input
              type="number"
              placeholder="Мінімальна ціна"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Ціна до</Label>
            <Input
              type="number"
              placeholder="Максимальна ціна"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Тип кузова</Label>
            <Select value={category} onValueChange={(value) => setCategory(value)}>
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
          </div>

          <div className="space-y-2">
            <Label>Коробка передач</Label>
            <Select value={transmission} onValueChange={(value) => setTransmission(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Коробка передач" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі типи</SelectItem>
                <SelectItem value="Автомат">Автомат</SelectItem>
                <SelectItem value="Механіка">Механіка</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Тип палива</Label>
            <Select value={fuelType} onValueChange={(value) => setFuelType(value)}>
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

          <div className="space-y-2">
            <Label>Сортування</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Сортувати за" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">За замовчуванням</SelectItem>
                <SelectItem value="price-asc">Ціна (від низької до високої)</SelectItem>
                <SelectItem value="price-desc">Ціна (від високої до низької)</SelectItem>
                <SelectItem value="year-desc">Рік (новіші спочатку)</SelectItem>
                <SelectItem value="year-asc">Рік (старіші спочатку)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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