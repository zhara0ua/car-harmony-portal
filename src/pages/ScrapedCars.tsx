
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ScrapedCars() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Сторінку видалено</h1>
          <p className="text-muted-foreground">
            Функціональність парсера було видалено з цього додатку.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
