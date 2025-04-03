
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
      title: "Zapytanie wysłane",
      description: "Skontaktujemy się z Tobą wkrótce, aby omówić szczegóły",
    });

    setName("");
    setPhone("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Profesjonalny Dobór Samochodu</h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <Wrench className="w-12 h-12 text-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Kontrola Techniczna</h3>
                <p className="text-gray-600 text-center">Pełna diagnostyka wszystkich systemów samochodu przez profesjonalnych mechaników</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <CheckCircle className="w-12 h-12 text-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Czystość Prawna</h3>
                <p className="text-gray-600 text-center">Weryfikacja historii pojazdu i całej dokumentacji</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-full mb-4">
                  <Car className="w-12 h-12 text-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Jazda Próbna</h3>
                <p className="text-gray-600 text-center">Pełne testowanie pojazdu w różnych trybach</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Zamów Inspekcję</CardTitle>
              <CardDescription>
                Zostaw swoje dane kontaktowe, a my skontaktujemy się z Tobą, aby omówić szczegóły
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twoje imię</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Wprowadź swoje imię"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Numer telefonu</label>
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
                  <label className="text-sm font-medium">Opisz, który samochód Cię interesuje</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Marka, model, rok, budżet..."
                    className="w-full"
                    rows={4}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-navy hover:bg-navy/90">
                  Wyślij zapytanie
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Inspection;
