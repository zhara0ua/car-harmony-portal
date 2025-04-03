
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export const AdminAuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check auth status from localStorage
    const authStatus = localStorage.getItem("adminAuthenticated") === "true";
    console.log("AdminAuthGuard - Authentication status:", authStatus);
    setIsAuthenticated(authStatus);
  }, []);
  
  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }
  
  if (!isAuthenticated) {
    console.log("AdminAuthGuard - Redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("AdminAuthGuard - User is authenticated, showing protected content");
  return <Outlet />;
};
