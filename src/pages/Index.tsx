
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: "🚗",
      title: "Luksusowe Samochody",
      description: "Przeglądaj naszą wyselekcjonowaną kolekcję luksusowych pojazdów."
    },
    {
      icon: "🌎",
      title: "Usługi Importowe",
      description: "Sprowadzamy samochody z rynków międzynarodowych."
    },
    {
      icon: "🔍",
      title: "Profesjonalna Inspekcja",
      description: "Kompleksowe przeglądy pojazdów przez certyfikowanych techników."
    },
    {
      icon: "🔨",
      title: "Aukcje Samochodowe",
      description: "Korzystne oferty samochodów z aukcji międzynarodowych."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedCars />
      
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy mb-12 text-center">Nasze Usługi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate('/auctions')}
              className="bg-gold text-navy hover:bg-gold/90"
            >
              Przejdź do aukcji
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
