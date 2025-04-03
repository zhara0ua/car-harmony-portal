
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-navy mb-8 text-center">Kontakt</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Nasze kontakty</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-navy flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Adres</h3>
                      <p className="text-gray-600">Strzygłowska 15, Wawer 04-872 Warszawa</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-navy flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Telefon</h3>
                      <p className="text-gray-600">+48 123 456 789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-navy flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-gray-600">info@kristinauto.pl</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-navy flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Godziny pracy</h3>
                      <p className="text-gray-600">Pon-Pt: 9:00 - 18:00</p>
                      <p className="text-gray-600">Sb: 10:00 - 15:00</p>
                      <p className="text-gray-600">Nd: Zamknięte</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">O nas</h2>
                <p className="text-gray-600 mb-4">
                  Kristin Auto - to zespół profesjonalistów z wieloletnim doświadczeniem w sprzedaży i imporcie samochodów klasy premium. 
                  Specjalizujemy się w doborze i dostawie samochodów z europejskich aukcji, zapewniając pełną obsługę transakcji i przejrzystość na każdym etapie.
                </p>
                <p className="text-gray-600">
                  Naszą misją jest uczynienie procesu zakupu samochodu jak najbardziej komfortowym i bezpiecznym dla naszych klientów, 
                  zapewniając dostęp do najlepszych ofert na rynku europejskim.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="h-[600px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.7936919562344!2d21.1558413!3d52.2334567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDEzJzU5LjQiTiAyMcKwMDknMjEuMCJF!5e0!3m2!1sen!2spl!4v1650000000000!5m2!1sen!2spl"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '0.5rem' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
