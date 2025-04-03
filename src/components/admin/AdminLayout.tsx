
import React from "react";
import AdminDashboard from "@/pages/admin/Dashboard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AdminDashboard>
      {children}
    </AdminDashboard>
  );
};
