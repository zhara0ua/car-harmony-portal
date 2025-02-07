import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ShieldCheck, Euro, Truck, FileCheck, Settings } from "lucide-react";

const Imports = () => {
  const benefits = [
    {
      icon: <Car className="w-8 h-8 mb-4 text-navy" />,
      title: "Широкий вибір автомобілів",
      description: "Доступ до тисяч автомобілів з найкращих європейських аукціонів."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 mb-4 text-navy" />,
      title: "Перевірена історія",
      description: "Повна прозорість історії автомобіля, включаючи сервісні записи та аварії."
    },
    {
      icon: <Euro className="w-8 h-8 mb-4 text-navy" />,
      title: "Краща ціна",
      description: "Значна економія порівняно з локальним ринком завдяки прямому імпорту."
    },
    {
      icon: <Truck className="w-8 h-8 mb-4 text-navy" />,
      title: "Повний супровід",
      description: "Ми беремо на себе всі питання з транспортування та розмитнення."
    },
    {
      icon: <FileCheck className="w-8 h-8 mb-4 text-navy" />,
      title: "Легальність",
      description: "Всі автомобілі проходять офіційне розмитнення та реєстрацію."
    },
    {
      icon: <Settings className="w-8 h-8 mb-4 text-navy" />,
      title: "Технічний стан",
      description: "Європейські авто відрізняються кращим технічним станом та обслуговуванням."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <div className="relative mb-16">
          <img 
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80"
            alt="Luxury car auction"
            className="w-full h-[400px] object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-transparent rounded-lg">
            <div className="h-full flex items-center">
              <div className="max-w-2xl px-8 text-white">
                <h1 className="text-4xl font-bold mb-4">Імпорт автомобілів з Європи</h1>
                <p className="text-lg mb-6">
                  Ми спеціалізуємося на імпорті преміальних автомобілів з найкращих європейських аукціонів. 
                  Наша команда експертів забезпечує повний супровід угоди та гарантує прозорість на кожному етапі.
                </p>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  +48 123 456 789
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Чому варто купувати авто з Європи?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <ShieldCheck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                    <span>Краща якість автомобілів та їх комплектація</span>
                  </li>
                  <li className="flex items-start">
                    <FileCheck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                    <span>Прозора історія експлуатації та обслуговування</span>
                  </li>
                  <li className="flex items-start">
                    <Settings className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                    <span>Відсутність корозії завдяки якісним дорогам</span>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Euro className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                    <span>Вигідніша ціна порівняно з локальним ринком</span>
                  </li>
                  <li className="flex items-start">
                    <Car className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                    <span>Більший вибір модифікацій та комплектацій</span>
                  </li>
                  <li className="flex items-start">
                    <Truck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                    <span>Повний супровід імпорту та оформлення</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                {benefit.icon}
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-navy text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Готові імпортувати своє ідеальне авто?</h2>
          <p className="mb-6">Зв'яжіться з нами для консультації та розрахунку вартості</p>
          <Badge variant="secondary" className="text-lg py-2 px-4">
            +48 123 456 789
          </Badge>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Imports;