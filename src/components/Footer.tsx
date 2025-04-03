
const Footer = () => {
  return (
    <div className="w-full min-w-full bg-navy">
      <footer className="w-full text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Kristin Auto</h3>
              <p className="text-gray-300">
                Twój niezawodny partner w wyborze samochodu klasy premium
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
              <div className="space-y-2 text-gray-300">
                <p>Telefon: +48 123 456 789</p>
                <p>Email: info@kristinauto.pl</p>
                <p>Adres: Strzygłowska 15,</p>
                <p>Wawer 04-872 Warszawa</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Usługi</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Sprzedaż samochodów</li>
                <li>Import na zamówienie</li>
                <li>Inspekcja samochodów</li>
                <li>Konsultacje</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Godziny pracy</h4>
              <div className="space-y-2 text-gray-300">
                <p>Pon-Pt: 9:00 - 18:00</p>
                <p>Sb: 10:00 - 15:00</p>
                <p>Nd: Zamknięte</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Kristin Auto. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
