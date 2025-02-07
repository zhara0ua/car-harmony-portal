import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Contact from "@/pages/Contact";
import Imports from "@/pages/Imports";
import Inspection from "@/pages/Inspection";
import InspectionCase from "@/pages/InspectionCase";
import CarDetails from "@/pages/CarDetails";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/import" element={<Imports />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/inspection/:id" element={<InspectionCase />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;