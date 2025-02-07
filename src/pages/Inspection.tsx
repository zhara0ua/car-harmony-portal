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

const Inspection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
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

  const completedInspections = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz S-Class",
      year: "2020",
      result: "Успішно придбано"
    },
    {
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
      name: "BMW 7 Series",
      year: "2021",
      result: "Виявлено приховані дефекти"
    },
    {
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      name: "Audi A8",
      year: "2022",
      result: "Успішно придбано"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Професійний Автопідбір</h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Wrench className="w-12 h-12 text-navy mb-4" />
                <h3 className="text-xl font-semibold mb-2">Технічна Перевірка</h3>
                <p className="text-gray-600">Повна діагностика всіх систем автомобіля професійними механіками</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <CheckCircle className="w-12 h-12 text-navy mb-4" />
                <h3 className="text-xl font-semibold mb-2">Юридична Чистота</h3>
                <p className="text-gray-600">Перевірка історії автомобіля та всієї документації</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Car className="w-12 h-12 text-navy mb-4" />
                <h3 className="text-xl font-semibold mb-2">Тест-Драйв</h3>
                <p className="text-gray-600">Повноцінне тестування автомобіля в різних режимах</p>
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
            <div className="grid md:grid-cols-3 gap-6">
              {completedInspections.map((car, index) => (
                <Card key={index} className="overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.name} 
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{car.name}</h3>
                    <p className="text-sm text-gray-600">{car.year}</p>
                    <p className="text-sm font-medium text-navy mt-2">{car.result}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Inspection;