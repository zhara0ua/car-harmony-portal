import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative h-[600px] bg-navy text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-navy/60"></div>
      </div>
      <div className="relative container mx-auto px-6 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-6">
            Discover Your Perfect Drive
          </h1>
          <p className="text-xl mb-8">
            Premium vehicles, expert imports, and thorough inspections for the discerning driver.
          </p>
          <div className="space-x-4">
            <Button className="bg-gold text-navy hover:bg-gold/90">
              View Inventory
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Schedule Inspection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;