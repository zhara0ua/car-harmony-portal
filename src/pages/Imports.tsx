
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ShieldCheck, Euro, Truck, FileCheck, Tools } from "lucide-react";

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
      icon: <Tools className="w-8 h-8 mb-4 text-navy" />,
      title: "Технічний стан",
      description: "Європейські авто відрізняються кращим технічним станом та обслуговуванням."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-navy mb-8 text-center">Імпорт автомобілів з Європи</h1>
        
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-lg text-gray-700 mb-6">
            Ми спеціалізуємося на імпорті преміальних автомобілів з найкращих європейських аукціонів. 
            Наша команда експертів забезпечує повний супровід угоди та гарантує прозорість на кожному етапі.
          </p>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Чому варто купувати авто з Європи?</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Краща якість автомобілів та їх комплектація</li>
                <li>Прозора історія експлуатації та обслуговування</li>
                <li>Відсутність корозії завдяки якісним дорогам</li>
                <li>Вигідніша ціна порівняно з локальним ринком</li>
                <li>Більший вибір модифікацій та комплектацій</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
