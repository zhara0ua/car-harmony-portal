
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

export default function ScrapedCars() {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">
            {i18n.language === 'ua' || i18n.language === 'ru' 
              ? "Сторінку видалено" 
              : i18n.language === 'pl' 
                ? "Strona usunięta" 
                : "Page removed"}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'ua' || i18n.language === 'ru' 
              ? "Функціональність парсера було видалено з цього додатку." 
              : i18n.language === 'pl' 
                ? "Funkcjonalność parsera została usunięta z tej aplikacji." 
                : "The parser functionality has been removed from this application."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
