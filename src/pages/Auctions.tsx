
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Calendar, Tag, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuctionCar {
  id: number;
  make: string;
  model: string;
  year: number;
  image: string;
  current_price: number;
  end_date: string;
}

const Auctions = () => {
  const { t } = useTranslation();
  const [auctionCars, setAuctionCars] = useState<AuctionCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This will be implemented later to fetch auction cars from the database
  const fetchAuctionCars = async () => {
    try {
      setIsLoading(true);
      // Placeholder for future implementation
      // const { data, error } = await supabase.from('auctions').select('*').join('cars').eq('status', 'active');
      
      // For now, using mock data
      const mockData: AuctionCar[] = [
        {
          id: 1,
          make: "BMW",
          model: "X5",
          year: 2020,
          image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym13fGVufDB8fDB8fHww",
          current_price: 35000,
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          make: "Mercedes",
          model: "E-Class",
          year: 2021,
          image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVyY2VkZXMlMjBlJTIwY2xhc3N8ZW58MHx8MHx8fDA%3D",
          current_price: 42000,
          end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          make: "Audi",
          model: "Q7",
          year: 2019,
          image: "https://images.unsplash.com/photo-1614026480209-cd9934144671?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXVkaSUyMHE3fGVufDB8fDB8fHww",
          current_price: 38000,
          end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      setAuctionCars(mockData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching auction cars:", error);
      setIsLoading(false);
    }
  };

  useState(() => {
    fetchAuctionCars();
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeRemaining = (endDateStr: string) => {
    const endDate = new Date(endDateStr);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Finished";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-navy mb-4">Car Auctions</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Bid on exclusive vehicles from auctions around the world. We provide access to premium car
              auctions with real-time bidding and detailed vehicle information.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-200 hover:shadow-lg transition-all">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 animate-pulse w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 animate-pulse w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctionCars.map((car) => (
                <Card key={car.id} className="border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={car.image} 
                      alt={`${car.make} ${car.model}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{car.make} {car.model} ({car.year})</CardTitle>
                    <CardDescription>Online car auction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-navy" />
                        <span className="font-semibold">{formatPrice(car.current_price)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-navy" />
                        <span>Time left: <span className="font-semibold">{formatTimeRemaining(car.end_date)}</span></span>
                      </div>
                      
                      <div className="pt-4">
                        <button className="w-full bg-navy hover:bg-navy/90 text-white py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
                          <Gavel className="h-4 w-4" />
                          <span>Place Bid</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auctions;
