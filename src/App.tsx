
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Inventory from "@/pages/Inventory";
import CarDetails from "@/pages/CarDetails";
import Contact from "@/pages/Contact";
import Inspection from "@/pages/Inspection";
import InspectionCase from "@/pages/InspectionCase";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCars from "@/pages/admin/Cars";
import AdminUsers from "@/pages/admin/Users";
import AdminInspections from "@/pages/admin/Inspections";
import AdminSettings from "@/pages/admin/Settings";
import AdminStatistics from "@/pages/admin/Statistics";
import ScrapedCars from "@/pages/ScrapedCars";
import Imports from "@/pages/Imports";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inspection" element={<Inspection />} />
        <Route path="/inspection/:id" element={<InspectionCase />} />
        <Route path="/scraped-cars" element={<ScrapedCars />} />
        <Route path="/imports" element={<Imports />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="cars" element={<AdminCars />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="inspections" element={<AdminInspections />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="statistics" element={<AdminStatistics />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
