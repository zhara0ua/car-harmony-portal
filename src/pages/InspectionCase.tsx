
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InspectionCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // This would typically come from an API, using static data for now
  const inspectionCases = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz S-Class",
      year: "2020",
      result: "Pomyślnie zakupiony",
      description: "Szczegółowa kontrola wykazała doskonały stan samochodu. Przeprowadzono pełną diagnostykę silnika, zawieszenia i elektroniki. Zweryfikowano historię serwisową i potwierdzono oryginalny przebieg. Klient otrzymał pełny raport o stanie pojazdu oraz zalecenia dotyczące przyszłego użytkowania."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
      name: "BMW 7 Series",
      year: "2021",
      result: "Wykryto ukryte wady",
      description: "Podczas inspekcji wykryto poważne problemy z układem przeniesienia napędu oraz ślady wcześniejszych wypadków. Dzięki naszej dokładnej kontroli, klient uniknął zakupu problematycznego samochodu. Dostarczono szczegółowy raport o wszystkich wykrytych wadach i zalecenia dotyczące poszukiwania alternatywnych opcji."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      name: "Audi A8",
      year: "2022",
      result: "Pomyślnie zakupiony",
      description: "Samochód przeszedł pełną diagnostykę techniczną z doskonałymi wynikami. Potwierdzono oryginalny przebieg i brak wypadków. Przeprowadzono kontrolę wszystkich systemów elektronicznych i potwierdzono zgodność z zadeklarowanymi parametrami. Klient otrzymał pełny pakiet dokumentów i zalecenia dotyczące serwisowania."
    }
  ];

  const currentCase = inspectionCases.find(c => c.id === Number(id));

  if (!currentCase) {
    return <div>Inspekcja nie została znaleziona</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-silver to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="mb-6 text-navy hover:text-navy/90"
          onClick={() => navigate('/inspection')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nasze Udane Dobory
        </Button>

        <div className="max-w-4xl mx-auto">
          <img 
            src={currentCase.image} 
            alt={currentCase.name} 
            className="w-full h-[400px] object-cover rounded-lg mb-8"
          />
          
          <h1 className="text-3xl font-bold text-navy mb-4">
            {currentCase.name} ({currentCase.year})
          </h1>
          
          <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Profesjonalny Dobór Samochodu</h2>
            <p className="text-lg font-medium text-navy mb-4">{currentCase.result}</p>
            <p className="text-gray-700 leading-relaxed">{currentCase.description}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InspectionCase;
