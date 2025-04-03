
import { useTranslation } from "react-i18next";

interface CarDetailsInfoProps {
  name: string;
  year: number;
  price: string;
  mileage: string;
  category: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  engine_power: string;
  make: string;
  model: string;
}

const CarDetailsInfo = ({
  name,
  year,
  price,
  mileage,
  category,
  transmission,
  fuel_type,
  engine_size,
  engine_power,
  make,
  model,
}: CarDetailsInfoProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-navy">{name}</h1>
          <p className="text-gray-600">{t('carDetails.year')}: {year}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-navy">{price}</p>
          <p className="text-gray-600">{t('carDetails.mileage')}: {mileage}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="text-gray-600">{t('carDetails.bodyType')}</p>
          <p className="font-semibold">{category}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('carDetails.transmission')}</p>
          <p className="font-semibold">{transmission}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('carDetails.fuelType')}</p>
          <p className="font-semibold">{fuel_type}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('carDetails.engine')}</p>
          <p className="font-semibold">{engine_size} / {engine_power}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-gray-600">{t('carDetails.make')}</p>
          <p className="font-semibold">{make}</p>
        </div>
        <div>
          <p className="text-gray-600">{t('carDetails.model')}</p>
          <p className="font-semibold">{model}</p>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsInfo;
