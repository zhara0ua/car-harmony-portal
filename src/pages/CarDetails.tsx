
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CarImageGallery from "@/components/car/CarImageGallery";
import CarDetailsInfo from "@/components/car/CarDetailsInfo";

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
  image: string;
  images?: string[];
  make: string;
  model: string;
  price_number: number;
  created_at: string;
}

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', Number(id))
          .single();

        if (error) throw error;

        if (data) {
          // If the car doesn't have an images array, add the default image
          if (!data.images || data.images.length === 0) {
            data.images = [data.image];
            
            // Add an extra stock image
            const extraImage = "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
            data.images.push(extraImage);
          }
          
          setCar(data);
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        toast({
          title: "Nie znaleziono samochodu",
          description: "Niestety, informacje o tym samochodzie nie są dostępne.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCar();
    }
  }, [id, toast]);

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
            <h1 className="text-2xl font-bold text-navy mb-4">Nie znaleziono samochodu</h1>
            <p className="text-gray-600">Niestety, informacje o tym samochodzie nie są dostępne.</p>
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
          <CarImageGallery image={car.image} images={car.images} name={car.name} />
          <CarDetailsInfo {...car} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarDetails;
