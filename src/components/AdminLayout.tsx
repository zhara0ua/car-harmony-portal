import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "./Navbar";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: hasAdminRole, error } = await supabase.rpc('has_role', {
        role: 'admin'
      });

      console.log("Checking admin role:", { hasAdminRole, error });

      if (error) {
        console.error("Error checking admin role:", error);
        toast({
          variant: "destructive",
          title: "Помилка перевірки прав доступу",
          description: error.message,
        });
        navigate("/");
        return;
      }

      if (!hasAdminRole) {
        console.log("User is not an admin, redirecting to home");
        toast({
          variant: "destructive",
          title: "Доступ заборонено",
          description: "У вас немає прав адміністратора",
        });
        navigate("/");
      }
    };

    checkAdminRole();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
};