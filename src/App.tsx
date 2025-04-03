
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Index from './pages/Index';
import Auctions from './pages/Auctions';
import CarDetails from './pages/CarDetails';
import Inventory from './pages/Inventory';
import Imports from './pages/Imports';
import Contact from './pages/Contact';
import Inspection from './pages/Inspection';
import InspectionCase from './pages/InspectionCase';
import ScrapedCars from './pages/ScrapedCars';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Cars from './pages/admin/Cars';
import Users from './pages/admin/Users';
import AuctionCars from './pages/admin/AuctionCars';
import Inspections from './pages/admin/Inspections';
import Settings from './pages/admin/Settings';
import Statistics from './pages/admin/Statistics';
import NotFound from './pages/NotFound';
import AdminLayout from './components/admin/AdminLayout';
import AuctionRegistrations from './pages/admin/AuctionRegistrations';
import { Toaster } from "@/components/ui/toaster";
import { AdminAuthGuard } from './components/admin/AdminAuthGuard';

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/inspection-case/:id" element={<InspectionCase />} />
          <Route path="/scraped-cars" element={<ScrapedCars />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminAuthGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cars" element={<Cars />} />
              <Route path="users" element={<Users />} />
              <Route path="auction-cars" element={<AuctionCars />} />
              <Route path="auction-registrations" element={<AuctionRegistrations />} />
              <Route path="inspections" element={<Inspections />} />
              <Route path="settings" element={<Settings />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
          </Route>
          
          <Route path="/admin/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
