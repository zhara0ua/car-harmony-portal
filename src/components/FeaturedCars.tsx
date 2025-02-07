import { useState } from "react";
import CarCard from "./CarCard";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FeaturedCars = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const cars = [
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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= cars.length - 3 ? 0 : prevIndex + 3
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? cars.length - 3 : prevIndex - 3
    );
  };

  return (
    <section className="py-16 bg-silver">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-navy mb-8">Wyróżnione Pojazdy</h2>
        
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {cars.map((car, index) => (
                <div key={index} className="w-1/3 flex-shrink-0 px-2">
                  <CarCard {...car} />
                </div>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;