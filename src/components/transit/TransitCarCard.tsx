
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Gavel, PackageOpen } from "lucide-react";
import { TransitCar } from "./types";

interface TransitCarCardProps {
  car: TransitCar;
}

// Helper functions
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

const TransitCarCard = ({ car }: TransitCarCardProps) => {
  return (
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
  );
};

export default TransitCarCard;
