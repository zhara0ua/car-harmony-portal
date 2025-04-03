
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from './ui/button';

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      // Show the banner after a small delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-medium mb-1">Ta strona używa plików cookie</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              Używamy plików cookie, aby zapewnić najlepsze doświadczenia na naszej stronie. 
              Dowiedz się więcej w naszym <Link to="/regulations" className="text-navy underline">Regulaminie</Link>.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm" 
              onClick={() => setVisible(false)}
            >
              Odrzuć
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-sm bg-navy hover:bg-navy/90" 
              onClick={acceptCookies}
            >
              Akceptuj wszystkie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
