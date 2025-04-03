
import { Navigate, Outlet } from "react-router-dom";

export const AdminAuthGuard = () => {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
