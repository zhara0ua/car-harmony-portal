
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ShieldCheck, Euro, Truck, FileCheck, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const Imports = () => {
  const { t } = useTranslation();

  const benefitIcons = {
    "Широкий вибір автомобілів": <Car className="w-8 h-8 mb-4 text-navy" />,
    "Перевірена історія": <ShieldCheck className="w-8 h-8 mb-4 text-navy" />,
    "Краща ціна": <Euro className="w-8 h-8 mb-4 text-navy" />,
    "Повний супровід": <Truck className="w-8 h-8 mb-4 text-navy" />,
    "Легальність": <FileCheck className="w-8 h-8 mb-4 text-navy" />,
    "Технічний стан": <Settings className="w-8 h-8 mb-4 text-navy" />
  };

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
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t('import.title')}</h1>
                <p className="text-base sm:text-lg mb-4 sm:mb-6">
                  {t('import.subtitle')}
                </p>
                <Badge variant="secondary" className="text-base sm:text-lg py-1.5 sm:py-2 px-3 sm:px-4">
                  {t('import.phoneNumber')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6">{t('import.whyEurope.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-4">
                  {t('import.whyEurope.benefits', { returnObjects: true }).slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      {index === 0 && <ShieldCheck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />}
                      {index === 1 && <FileCheck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />}
                      {index === 2 && <Settings className="w-6 h-6 text-navy mr-2 flex-shrink-0" />}
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ul className="space-y-4">
                  {t('import.whyEurope.benefits', { returnObjects: true }).slice(3, 6).map((benefit, index) => (
                    <li key={index + 3} className="flex items-start">
                      {index === 0 && <Euro className="w-6 h-6 text-navy mr-2 flex-shrink-0" />}
                      {index === 1 && <Car className="w-6 h-6 text-navy mr-2 flex-shrink-0" />}
                      {index === 2 && <Truck className="w-6 h-6 text-navy mr-2 flex-shrink-0" />}
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-6 text-center">{t('import.services.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {t('import.services.items', { returnObjects: true }).map((service, index) => {
            const iconKey = Object.keys(benefitIcons)[index];
            return (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center">
                  <div className="flex justify-center">
                    {benefitIcons[iconKey as keyof typeof benefitIcons]}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-navy text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('import.cta.title')}</h2>
          <p className="mb-6">{t('import.cta.subtitle')}</p>
          <Badge variant="secondary" className="text-lg py-2 px-4">
            {t('import.phoneNumber')}
          </Badge>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Imports;
