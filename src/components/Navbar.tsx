import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    console.log("Mobile menu toggled:", !isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md relative">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-navy">
            Kristin Auto
          </Link>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`${
                isActive("/") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/inventory"
              className={`${
                isActive("/inventory") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              {t('nav.cars')}
            </Link>
            <Link
              to="/imports"
              className={`${
                isActive("/imports") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              {t('nav.import')}
            </Link>
            <Link
              to="/inspection"
              className={`${
                isActive("/inspection") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              {t('nav.inspection')}
            </Link>
            <Link
              to="/contact"
              className={`${
                isActive("/contact") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50">
            <div className="flex flex-col space-y-4 p-4">
              <Link
                to="/"
                className={`${
                  isActive("/") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/inventory"
                className={`${
                  isActive("/inventory") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.cars')}
              </Link>
              <Link
                to="/imports"
                className={`${
                  isActive("/imports") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.import')}
              </Link>
              <Link
                to="/inspection"
                className={`${
                  isActive("/inspection") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.inspection')}
              </Link>
              <Link
                to="/contact"
                className={`${
                  isActive("/contact") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;