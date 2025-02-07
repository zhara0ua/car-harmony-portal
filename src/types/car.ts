
export interface Car {
  id: string;
  images: string[];
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
  description?: string;
}
