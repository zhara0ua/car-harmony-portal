
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import CarDetails from "./pages/CarDetails";
import Inspection from "./pages/Inspection";
import InspectionCase from "./pages/InspectionCase";
import Imports from "./pages/Imports";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Cars from "./pages/admin/Cars";
import Inspections from "./pages/admin/Inspections";
import Statistics from "./pages/admin/Statistics";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/inspection/:id" element={<InspectionCase />} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route path="users" element={<Users />} />
            <Route path="cars" element={<Cars />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
