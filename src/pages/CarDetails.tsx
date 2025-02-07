import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const CarDetails = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // This would typically come from an API or database
  const carDetails = {
    name: "Mercedes-Benz S-Class",
    price: "85.000 zł",
    year: 2023,
    mileage: "24.000 km",
    category: "Седан",
    transmission: "Автомат",
    fuelType: "Бензин",
    engineSize: "3.0л",
    enginePower: "435 к.с.",
    description: "Mercedes-Benz S-Class - втілення розкоші та інновацій. Цей автомобіль обладнаний найсучаснішими технологіями та забезпечує неперевершений комфорт.",
    features: [
      "Панорамний дах",
      "Масаж сидінь",
      "Преміум аудіосистема Burmester",
      "Система нічного бачення",
      "Активний круїз-контроль",
      "4-зонний клімат-контроль"
    ],
    images: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?auto=format&fit=crop&q=80"
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === carDetails.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? carDetails.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {carDetails.images.map((image, index) => (
              <Dialog key={index} open={isGalleryOpen && currentImageIndex === index} onOpenChange={setIsGalleryOpen}>
                <DialogTrigger asChild>
                  <img
                    src={image}
                    alt={`${carDetails.name} - фото ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    onClick={() => setCurrentImageIndex(index)}
                  />
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0">
                  <div className="relative h-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-50"
                      onClick={() => setIsGalleryOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <img
                      src={carDetails.images[currentImageIndex]}
                      alt={`${carDetails.name} - фото ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
          
          {/* Car Information */}
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-navy">{carDetails.name}</h1>
                <p className="text-gray-600">Рік випуску: {carDetails.year}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-navy">{carDetails.price}</p>
                <p className="text-gray-600">Пробіг: {carDetails.mileage}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-gray-600">Тип кузова</p>
                <p className="font-semibold">{carDetails.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Коробка передач</p>
                <p className="font-semibold">{carDetails.transmission}</p>
              </div>
              <div>
                <p className="text-gray-600">Паливо</p>
                <p className="font-semibold">{carDetails.fuelType}</p>
              </div>
              <div>
                <p className="text-gray-600">Двигун</p>
                <p className="font-semibold">{carDetails.engineSize} / {carDetails.enginePower}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Опис</h2>
              <p className="text-gray-700">{carDetails.description}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Комплектація</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {carDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;