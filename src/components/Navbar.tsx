import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`${
                isActive("/") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              Strona główna
            </Link>
            <Link
              to="/inventory"
              className={`${
                isActive("/inventory") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              Samochody
            </Link>
            <Link
              to="/imports"
              className={`${
                isActive("/imports") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              Import
            </Link>
            <Link
              to="/inspection"
              className={`${
                isActive("/inspection") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              Inspekcje
            </Link>
            <Link
              to="/contact"
              className={`${
                isActive("/contact") ? "text-navy font-semibold" : "text-gray-700"
              } hover:text-navy transition-colors`}
            >
              Kontakt
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
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
                Strona główna
              </Link>
              <Link
                to="/inventory"
                className={`${
                  isActive("/inventory") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Samochody
              </Link>
              <Link
                to="/imports"
                className={`${
                  isActive("/imports") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Import
              </Link>
              <Link
                to="/inspection"
                className={`${
                  isActive("/inspection") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inspekcje
              </Link>
              <Link
                to="/contact"
                className={`${
                  isActive("/contact") ? "text-navy font-semibold" : "text-gray-700"
                } hover:text-navy transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;