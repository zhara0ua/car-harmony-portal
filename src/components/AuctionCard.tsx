
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";
import { AuctionWithCar } from "@/types/auction";

interface AuctionCardProps {
  auction: AuctionWithCar;
  onBid?: () => void;
}

const AuctionCard = ({ auction, onBid }: AuctionCardProps) => {
  const timeLeft = new Date(auction.end_date).getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={auction.cars.image} 
          alt={auction.cars.name}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
        {auction.status === 'ended' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xl font-bold">Аукціон завершено</span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{auction.cars.name}</span>
          <span className="text-green-600">{auction.current_price.toLocaleString()} zł</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Рік:</span>
            <span>{auction.cars.year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Пробіг:</span>
            <span>{auction.cars.mileage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Початкова ціна:</span>
            <span>{auction.start_price.toLocaleString()} zł</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {auction.status === 'active' 
            ? `${daysLeft} днів до кінця`
            : 'Аукціон завершено'
          }
        </div>
        {auction.status === 'active' && (
          <Button onClick={onBid}>
            <Gavel className="mr-2 h-4 w-4" />
            Зробити ставку
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuctionCard;
