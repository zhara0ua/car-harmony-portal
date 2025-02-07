
import Navbar from "@/components/Navbar";
import CarCard from "@/components/CarCard";

const Inventory = () => {
  const cars = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz S-Class",
      price: "85.000 zł",
      year: 2023,
      mileage: "24.000 km"
    },
    {
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
      name: "BMW 7 Series",
      price: "78.500 zł",
      year: 2022,
      mileage: "35.000 km"
    },
    {
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      name: "Audi A8",
      price: "82.000 zł",
      year: 2023,
      mileage: "29.000 km"
    },
    {
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80",
      name: "Porsche Panamera",
      price: "125.000 zł",
      year: 2023,
      mileage: "15.000 km"
    },
    {
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80",
      name: "BMW X7",
      price: "92.000 zł",
      year: 2022,
      mileage: "31.000 km"
    },
    {
      image: "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz G-Class",
      price: "138.000 zł",
      year: 2023,
      mileage: "18.000 km"
    }
  ];

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-navy mb-8">Наші Автомобілі</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={index} {...car} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
