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
              Home
            </Link>
            <Link to="/inventory" className="text-gray-700 hover:text-navy transition-colors">
              Inventory
            </Link>
            <Link to="/imports" className="text-gray-700 hover:text-navy transition-colors">
              Imports
            </Link>
            <Link to="/inspections" className="text-gray-700 hover:text-navy transition-colors">
              Inspections
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-navy transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;