
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  
  const services = [
    {
      icon: "🚗",
      title: t('services.luxury'),
      description: t('services.luxuryDesc')
    },
    {
      icon: "🌎",
      title: t('services.import'),
      description: t('services.importDesc')
    },
    {
      icon: "🔍",
      title: t('services.inspection'),
      description: t('services.inspectionDesc')
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedCars />
      
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy mb-12 text-center">{t('services.title')}</h2>
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
