import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-navy">
            Kristin Auto
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-navy transition-colors">
              Strona główna
            </Link>
            <Link to="/inventory" className="text-gray-700 hover:text-navy transition-colors">
              Samochody
            </Link>
            <Link to="/imports" className="text-gray-700 hover:text-navy transition-colors">
              Import
            </Link>
            <Link to="/inspections" className="text-gray-700 hover:text-navy transition-colors">
              Inspekcje
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-navy transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;