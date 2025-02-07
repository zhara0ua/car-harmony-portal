import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Attempting login with:", { email });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Помилка входу",
          description: error.message,
        });
      } else {
        console.log("Login successful, checking role");
        
        const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
          role: 'admin'
        });

        if (roleError) {
          console.error("Error checking role:", roleError);
          toast({
            variant: "destructive",
            title: "Помилка перевірки ролі",
            description: roleError.message,
          });
          return;
        }

        console.log("Role check result:", { isAdmin });
        
        if (isAdmin) {
          console.log("User is admin, redirecting to admin panel");
          navigate("/admin");
        } else {
          console.log("User is not admin, redirecting to home");
          navigate("/");
        }

        toast({
          title: "Успішний вхід",
          description: "Ласкаво просимо!",
        });
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Сталася неочікувана помилка",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-silver flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">Вхід</h1>
          <p className="text-gray-600 mt-2">Увійдіть в свій обліковий запис</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-navy hover:bg-navy/90"
            disabled={loading}
          >
            {loading ? "Завантаження..." : "Увійти"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;