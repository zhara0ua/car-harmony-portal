
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wrench, CheckCircle, Car } from "lucide-react";
import InspectionCaseCard from "@/components/InspectionCaseCard";

const inspectionCases = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
    name: "Mercedes-Benz S-Class",
    year: "2020",
    result: "Успішно придбано",
    description: "Детальна перевірка виявила відмінний стан автомобіля..."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
    name: "BMW 7 Series",
    year: "2021",
    result: "Виявлено приховані дефекти",
    description: "Під час інспекції виявлено серйозні недоліки..."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
    name: "Audi A8",
    year: "2022",
    result: "Успішно придбано",
    description: "Автомобіль пройшов повну технічну діагностику..."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80",
    name: "Porsche Panamera",
    year: "2021",
    result: "Успішно придбано",
    description: "Повна перевірка підтвердила відмінний стан..."
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80",
    name: "Range Rover Sport",
    year: "2022",
    result: "Виявлено приховані дефекти",
    description: "Інспекція виявила проблеми з підвіскою..."
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80",
    name: "Maserati Ghibli",
    year: "2021",
    result: "Успішно придбано",
    description: "Технічний стан підтверджено як відмінний..."
  }
];

const Inspection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [visibleCases, setVisibleCases] = useState(3);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { name, phone, description });
    
    toast({
      title: "Запит надіслано",
      description: "Ми зв'яжемося з вами найближчим часом для уточнення деталей",
    });

    setName("");
    setPhone("");
    setDescription("");
  };

  const loadMore = () => {
    setVisibleCases(prev => Math.min(prev + 3, inspectionCases.length));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Професійний Автопідбір</h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <Wrench className="w-12 h-12 text-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Технічна Перевірка</h3>
                <p className="text-gray-600 text-center">Повна діагностика всіх систем автомобіля професійними механіками</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <CheckCircle className="w-12 h-12 text-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Юридична Чистота</h3>
                <p className="text-gray-600 text-center">Перевірка історії автомобіля та всієї документації</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <Car className="w-12 h-12 text-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Тест-Драйв</h3>
                <p className="text-gray-600 text-center">Повноцінне тестування автомобіля в різних режимах</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Замовити Інспекцію</CardTitle>
              <CardDescription>
                Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення деталей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ваше ім'я</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введіть ваше ім'я"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Номер телефону</label>
                  <Input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+48"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Опишіть, який автомобіль вас цікавить</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Марка, модель, рік, бюджет..."
                    className="w-full"
                    rows={4}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-navy hover:bg-navy/90">
                  Надіслати запит
                </Button>
              </form>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6">Наші Успішні Підбори</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {inspectionCases.slice(0, visibleCases).map((inspectionCase) => (
                <InspectionCaseCard 
                  key={inspectionCase.id} 
                  inspectionCase={inspectionCase}
                />
              ))}
            </div>
            {visibleCases < inspectionCases.length && (
              <div className="text-center">
                <Button 
                  onClick={loadMore}
                  className="bg-navy hover:bg-navy/90"
                >
                  Показати ще
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Inspection;
