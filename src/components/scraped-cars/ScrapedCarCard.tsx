
import { type ScrapedCar } from "@/types/scraped-car";

interface ScrapedCarCardProps {
  car: ScrapedCar;
}

export function ScrapedCarCard({ car }: ScrapedCarCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {car.image_url && (
        <img 
          src={car.image_url} 
          alt={car.title} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">{car.title}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Рік: {car.year}</div>
          <div>Ціна: {car.price.toLocaleString()} €</div>
          <div>Пробіг: {car.mileage}</div>
          <div>КПП: {car.transmission}</div>
          <div>Паливо: {car.fuel_type}</div>
          <div>Локація: {car.location}</div>
        </div>
        <a 
          href={car.external_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mt-4 text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Переглянути на сайті
        </a>
      </div>
    </div>
  );
}
