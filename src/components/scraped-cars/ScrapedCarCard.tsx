
import { ScrapedCar } from '@/types/scraped-car';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ScrapedCarCardProps {
  car: ScrapedCar;
  layout?: 'grid' | 'list';
}

const ScrapedCarCard = ({ car, layout = 'grid' }: ScrapedCarCardProps) => {
  if (layout === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/3 h-48">
            <img 
              src={car.image || '/placeholder.svg'} 
              alt={car.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-2">{car.title}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              {car.details.year && (
                <div>
                  <p className="text-muted-foreground">Year</p>
                  <p>{car.details.year}</p>
                </div>
              )}
              {car.details.mileage && (
                <div>
                  <p className="text-muted-foreground">Mileage</p>
                  <p>{car.details.mileage}</p>
                </div>
              )}
              {car.details.engine && (
                <div>
                  <p className="text-muted-foreground">Engine</p>
                  <p>{car.details.engine}</p>
                </div>
              )}
              {car.details.transmission && (
                <div>
                  <p className="text-muted-foreground">Transmission</p>
                  <p>{car.details.transmission}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">{car.price}</p>
              <a 
                href={car.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4">
        <CardTitle className="text-lg line-clamp-2 h-12">{car.title}</CardTitle>
      </CardHeader>
      <div className="relative pt-[56.25%] w-full">
        <img 
          src={car.image || '/placeholder.svg'} 
          alt={car.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {car.details.year && (
            <div>
              <p className="text-muted-foreground">Year</p>
              <p>{car.details.year}</p>
            </div>
          )}
          {car.details.mileage && (
            <div>
              <p className="text-muted-foreground">Mileage</p>
              <p>{car.details.mileage}</p>
            </div>
          )}
          {car.details.engine && (
            <div>
              <p className="text-muted-foreground">Engine</p>
              <p>{car.details.engine}</p>
            </div>
          )}
          {car.details.transmission && (
            <div>
              <p className="text-muted-foreground">Transmission</p>
              <p>{car.details.transmission}</p>
            </div>
          )}
          {car.details.fuel && (
            <div>
              <p className="text-muted-foreground">Fuel</p>
              <p>{car.details.fuel}</p>
            </div>
          )}
          {car.details.color && (
            <div>
              <p className="text-muted-foreground">Color</p>
              <p>{car.details.color}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-lg">{car.price}</p>
          <a 
            href={car.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            View Details
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ScrapedCarCard;
