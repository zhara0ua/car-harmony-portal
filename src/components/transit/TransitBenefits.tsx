
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Trophy, Gavel } from "lucide-react";

const TransitBenefits = () => {
  return (
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
  );
};

export default TransitBenefits;
