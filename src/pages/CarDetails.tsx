
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Image } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Car {
  id: number;
  name: string;
  price: string;
  year: number;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  description: string | null;
  features: string[] | null;
  images: string[];
}

const CarDetails = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setCar({
            ...data,
            description: data.description || "Опис відсутній",
            features: data.features || [],
            images: data.images ? 
              (Array.isArray(data.images) ? data.images : [data.image]) 
              : [data.image]
          });
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити інформацію про автомобіль",
          variant: "destructive",
        });
      } finally {
        setIsLoading(setIsLoading);
      }
    };

    if (id) {
      fetchCar();
    }
  }, [id, toast]);

  const nextImage = () => {
    if (!car) return;
    setCurrentImageIndex((prev) => 
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!car) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-silver">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-silver">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy mb-4">Автомобіль не знайдено</h1>
            <p className="text-gray-600">На жаль, інформація про цей автомобіль відсутня.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {isMobile ? (
              <div className="relative">
                <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                  <DialogTrigger asChild>
                    <div className="relative cursor-pointer">
                      <img
                        src={car.images[0]}
                        alt={`${car.name} - головне фото`}
                        className="w-full h-[300px] object-cover rounded-lg"
                      />
                      <div className="absolute bottom-4 right-4 bg-white/90 rounded-full p-2">
                        <Image className="w-6 h-6" />
                      </div>
                      <div className="absolute bottom-4 left-4 bg-white/90 rounded-full px-3 py-1">
                        <span className="text-sm font-medium">1 / {car.images.length}</span>
                      </div>
                    </div>
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
                        src={car.images[currentImageIndex]}
                        alt={`${car.name} - фото ${currentImageIndex + 1}`}
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
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.images.map((image, index) => (
                  <Dialog key={index} open={isGalleryOpen && currentImageIndex === index} onOpenChange={setIsGalleryOpen}>
                    <DialogTrigger asChild>
                      <img
                        src={image}
                        alt={`${car.name} - фото ${index + 1}`}
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
                          src={car.images[currentImageIndex]}
                          alt={`${car.name} - фото ${currentImageIndex + 1}`}
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
            )}
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-navy">{car.name}</h1>
                <p className="text-gray-600">Рік випуску: {car.year}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-navy">{car.price}</p>
                <p className="text-gray-600">Пробіг: {car.mileage}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-gray-600">Тип кузова</p>
                <p className="font-semibold">{car.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Коробка передач</p>
                <p className="font-semibold">{car.transmission}</p>
              </div>
              <div>
                <p className="text-gray-600">Паливо</p>
                <p className="font-semibold">{car.fuel_type}</p>
              </div>
              <div>
                <p className="text-gray-600">Двигун</p>
                <p className="font-semibold">{car.engine_size} / {car.engine_power}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Опис</h2>
              <p className="text-gray-700">{car.description}</p>
            </div>
            
            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Комплектація</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {car.features.map((feature, index) => (
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
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetails;
