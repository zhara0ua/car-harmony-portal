import {
  Home,
  Car,
  Users,
  Settings,
  BarChart,
  CheckSquare,
  Phone,
} from "lucide-react";
import { GavelIcon } from "@radix-ui/react-icons";
import { Sidebar } from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/cars", label: "Samochody", icon: Car },
    { href: "/admin/auction-cars", label: "Aukcje", icon: GavelIcon },
    { href: "/admin/auction-registrations", label: "CRM Aukcji", icon: Phone },
    { href: "/admin/inspections", label: "Przeglądy", icon: CheckSquare },
    { href: "/admin/users", label: "Użytkownicy", icon: Users },
    { href: "/admin/settings", label: "Ustawienia", icon: Settings },
    { href: "/admin/statistics", label: "Statystyki", icon: BarChart },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar links={adminLinks} />
      <main className="flex-1 p-4">
        <div className="flex justify-end items-center mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Admin"} />
                  <AvatarFallback>
                    {session?.user?.name?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="focus:outline-none">
                <span className="grid place-items-center">
                  {session?.user?.name}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="focus:outline-none">
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Render content based on current path */}
        {adminLinks.map((link) => {
          if (link.href === pathname) {
            return null;
          }
          return null;
        })}
        {/* Outlet */}
        {/* <Outlet /> */}
      </main>
    </div>
  );
}
