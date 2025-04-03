
import {
  Home,
  Car,
  Users,
  Settings,
  BarChart,
  CheckSquare,
  Phone,
  Gavel,
} from "lucide-react";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    toast({
      title: "Успішний вихід",
      description: "Ви вийшли з панелі адміністратора",
    });
    navigate("/admin/login");
  };

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/cars", label: "Samochody", icon: Car },
    { href: "/admin/auction-cars", label: "Aukcje", icon: Gavel },
    { href: "/admin/auction-registrations", label: "CRM Aukcji", icon: Phone },
    { href: "/admin/inspections", label: "Przeglądy", icon: CheckSquare },
    { href: "/admin/users", label: "Użytkownicy", icon: Users },
    { href: "/admin/settings", label: "Ustawienia", icon: Settings },
    { href: "/admin/statistics", label: "Statystyki", icon: BarChart },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="h-screen">
          <div className="py-2">
            {adminLinks.map((link) => (
              <Button
                key={link.href}
                variant={location.pathname === link.href ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => navigate(link.href)}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            ))}
          </div>
        </Sidebar>
        
        <main className="flex-1 p-4 overflow-auto">
          <div className="flex justify-end items-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="focus:outline-none">
                  <span className="grid place-items-center">Admin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="focus:outline-none">
                  Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
