
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ShieldCheck, Euro, Truck, FileCheck, Settings } from "lucide-react";

const Imports = () => {
  const benefitsList = [
    "Lepsza jakość samochodów i ich wyposażenie",
    "Przejrzysta historia użytkowania i konserwacji",
    "Brak korozji dzięki dobrej jakości drogom",
    "Lepsza cena w porównaniu do rynku lokalnego",
    "Większy wybór modyfikacji i konfiguracji",
    "Pełne wsparcie importu i rejestracji"
  ];

  const servicesItems = [
    {
      title: "Szeroki wybór samochodów",
      description: "Dostęp do tysięcy samochodów z najlepszych europejskich aukcji."
    },
    {
      title: "Zweryfikowana historia",
      description: "Pełna przejrzystość historii samochodu, w tym zapisy serwisowe i wypadki."
    },
    {
      title: "Lepsza cena",
      description: "Znaczne oszczędności w porównaniu do rynku lokalnego dzięki bezpośredniemu importowi."
    },
    {
      title: "Pełne wsparcie",
      description: "Zajmujemy się wszystkimi sprawami związanymi z transportem i odprawą celną."
    },
    {
      title: "Legalność",
      description: "Wszystkie samochody przechodzą oficjalną odprawę celną i rejestrację."
    },
    {
      title: "Stan techniczny",
      description: "Europejskie samochody mają lepszy stan techniczny i konserwację."
    }
  ];

  const benefitIcons = [
    <Car className="w-8 h-8 mb-4 text-navy" />,
    <ShieldCheck className="w-8 h-8 mb-4 text-navy" />,
    <Settings className="w-8 h-8 mb-4 text-navy" />,
    <Euro className="w-8 h-8 mb-4 text-navy" />,
    <Car className="w-8 h-8 mb-4 text-navy" />,
    <Truck className="w-8 h-8 mb-4 text-navy" />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="relative mb-12 sm:mb-16">
          <img 
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80"
            alt="Luxury car auction"
            className="w-full h-[300px] sm:h-[400px] object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-transparent rounded-lg">
            <div className="h-full flex items-center">
              <div className="max-w-2xl p-4 sm:px-8 text-white">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Import samochodów z Europy</h1>
                <p className="text-base sm:text-lg mb-4 sm:mb-6">
                  Specjalizujemy się w imporcie premium samochodów z najlepszych europejskich aukcji. Nasz zespół ekspertów zapewnia pełne wsparcie transakcji i gwarantuje przejrzystość na każdym etapie.
                </p>
                <Badge variant="secondary" className="text-base sm:text-lg py-1.5 sm:py-2 px-3 sm:px-4">
                  +48 123 456 789
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Dlaczego warto kupić samochód z Europy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-4">
                  {benefitsList.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <ShieldCheck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ul className="space-y-4">
                  {benefitsList.slice(3, 6).map((benefit, index) => (
                    <li key={index + 3} className="flex items-start">
                      <Euro className="w-6 h-6 text-navy mr-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6 text-center">Nasze zalety</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {servicesItems.map((service, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="flex flex-col items-center">
                <div className="flex justify-center">
                  {benefitIcons[index]}
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-navy text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Gotowy zaimportować swój idealny samochód?</h2>
          <p className="mb-6">Skontaktuj się z nami, aby uzyskać konsultację i kalkulację kosztów</p>
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
