
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";

const ContactBanner = () => {
  return (
    <div className="bg-navy text-white rounded-lg p-8 text-center">
      <Car className="w-12 h-12 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Зацікавлені в придбанні автомобіля з аукціону?</h2>
      <p className="mb-6">Зв'яжіться з нами, щоб отримати повну інформацію про доступні автомобілі</p>
      <Badge variant="secondary" className="text-lg py-2 px-4">
        +48 123 456 789
      </Badge>
    </div>
  );
};

export default ContactBanner;
