import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import ServiceCard from "@/components/ServiceCard";

const Index = () => {
  const services = [
    {
      icon: "🚗",
      title: "Premium Inventory",
      description: "Browse our selection of hand-picked luxury vehicles."
    },
    {
      icon: "🌎",
      title: "Import Service",
      description: "Source your dream car from international markets."
    },
    {
      icon: "🔍",
      title: "Expert Inspection",
      description: "Comprehensive vehicle inspections by certified technicians."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedCars />
      
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-navy mb-12 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;