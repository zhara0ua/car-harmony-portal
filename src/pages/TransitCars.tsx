
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Navigation, MapPin, Map, Car, Calendar, Clock, Gavel, Trophy, PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TransitCar {
  id: number;
  make: string;
  model: string;
  year: number;
  image: string;
  origin: string;
  destination: string;
  departureDate: string;
  estimatedArrival: string;
  status: "loading" | "in_transit" | "customs" | "delivery";
  progress: number;
  auctionPrice: number;
  marketPrice: number;
  discount: number;
}

const mockTransitCars: TransitCar[] = [
  {
    id: 1,
    make: "BMW",
    model: "X5",
    year: 2021,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
    origin: "Мюнхен, Німеччина",
    destination: "Київ, Україна",
    departureDate: "2023-10-15",
    estimatedArrival: "2023-10-25",
    status: "in_transit",
    progress: 65,
    auctionPrice: 28500,
    marketPrice: 32000,
    discount: 11
  },
  {
    id: 2,
    make: "Audi",
    model: "Q7",
    year: 2022,
    image: "https://images.unsplash.com/photo-1606664922998-f180200bd25a?auto=format&fit=crop&q=80",
    origin: "Інгольштадт, Німеччина",
    destination: "Львів, Україна",
    departureDate: "2023-10-18",
    estimatedArrival: "2023-10-28",
    status: "loading",
    progress: 10,
    auctionPrice: 33200,
    marketPrice: 38500,
    discount: 14
  },
  {
    id: 3,
    make: "Mercedes-Benz",
    model: "GLE",
    year: 2023,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80",
    origin: "Штутгарт, Німеччина",
    destination: "Одеса, Україна",
    departureDate: "2023-10-12",
    estimatedArrival: "2023-10-22",
    status: "customs",
    progress: 85,
    auctionPrice: 45000,
    marketPrice: 51000,
    discount: 12
  },
  {
    id: 4,
    make: "Volkswagen",
    model: "Touareg",
    year: 2022,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80",
    origin: "Вольфсбург, Німеччина",
    destination: "Харків, Україна",
    departureDate: "2023-10-10",
    estimatedArrival: "2023-10-20",
    status: "delivery",
    progress: 95,
    auctionPrice: 30800,
    marketPrice: 35500,
    discount: 13
  }
];

const getStatusLabel = (status: TransitCar["status"]): string => {
  switch (status) {
    case "loading":
      return "Завантаження";
    case "in_transit":
      return "В дорозі";
    case "customs":
      return "Митниця";
    case "delivery":
      return "Доставка";
    default:
      return "";
  }
};

const getStatusColor = (status: TransitCar["status"]): string => {
  switch (status) {
    case "loading":
      return "bg-blue-500";
    case "in_transit":
      return "bg-yellow-500";
    case "customs":
      return "bg-purple-500";
    case "delivery":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
};

const TransitCars = () => {
  const [transitCars, setTransitCars] = useState<TransitCar[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // In a real app, this would be an API call
    setTransitCars(mockTransitCars);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Автомобілі з аукціону в дорозі</h1>
          <p className="text-gray-600 mb-3">
            Ці автомобілі ми вже виграли на аукціоні, але вони ще в дорозі до України. 
            Ви можете придбати їх зараз зі знижкою до того, як вони прибудуть на наш майданчик.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5" />
              <p className="font-medium">Вигідна пропозиція!</p>
            </div>
            <p>Купуючи автомобіль, який ще в дорозі, ви отримуєте значну знижку від ринкової вартості.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {transitCars.map((car) => (
            <Card key={car.id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`} 
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className={`absolute top-4 right-4 ${getStatusColor(car.status)} text-white`}
                >
                  {getStatusLabel(car.status)}
                </Badge>
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-sm flex items-center">
                  <span>-{car.discount}%</span>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{car.make} {car.model} ({car.year})</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2 mb-4">
                    <Gavel className="w-5 h-5 text-navy flex-shrink-0 mt-1" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Ціна аукціону:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-lg">{formatPrice(car.auctionPrice)}</span>
                        <span className="text-sm line-through text-gray-500">{formatPrice(car.marketPrice)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <PackageOpen className="w-5 h-5 text-navy" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Маршрут:</span>
                      <span className="font-medium">{car.origin} → {car.destination}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-navy" />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Дата відправлення:</span>
                        <span className="font-medium">{formatDate(car.departureDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-navy" />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Орієнтовне прибуття:</span>
                        <span className="font-medium">{formatDate(car.estimatedArrival)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">Прогрес доставки</span>
                      <span className="text-sm font-medium">{car.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getStatusColor(car.status)}`} 
                        style={{ width: `${car.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-2">
                    Забронювати зі знижкою
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Gavel className="w-8 h-8 text-navy flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Аукціонні автомобілі</h3>
                <p className="text-gray-600">
                  Ми виграємо найкращі лоти на європейських аукціонах, обираючи автомобілі 
                  з підтвердженою історією та в ідеальному технічному стані.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <Trophy className="w-8 h-8 text-navy flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Економія до 15%</h3>
                <p className="text-gray-600">
                  Купуючи автомобіль, який ще в дорозі, ви отримуєте значну знижку в порівнянні з 
                  аналогічними автомобілями, які вже знаходяться на нашому майданчику.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Truck className="w-8 h-8 text-navy flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Надійне транспортування</h3>
                <p className="text-gray-600">
                  Ми співпрацюємо тільки з перевіреними транспортними компаніями, які мають досвід 
                  міжнародних перевезень автомобілів і гарантують безпечну доставку вашого авто.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-navy text-white rounded-lg p-8 text-center">
          <Car className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Зацікавлені в придбанні автомобіля з аукціону?</h2>
          <p className="mb-6">Зв'яжіться з нами, щоб отримати повну інформацію про доступні автомобілі</p>
          <Badge variant="secondary" className="text-lg py-2 px-4">
            +48 123 456 789
          </Badge>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TransitCars;
