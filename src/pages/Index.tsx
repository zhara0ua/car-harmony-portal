
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";

const Index = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
