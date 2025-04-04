
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    console.log("Login page - Current authentication status:", isAuthenticated);
    
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to admin dashboard");
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Login attempt with username:", username);

    // Simple hardcoded admin credentials
    // In a real app, this would use proper authentication from a backend
    if (username === "admin" && password === "ProdamGaraz19") {
      // Store auth status in localStorage
      localStorage.setItem("adminAuthenticated", "true");
      console.log("Login successful, authentication status set to true");
      
      toast({
        title: "Успішний вхід",
        description: "Ви успішно увійшли в панель адміністратора",
      });
      navigate("/admin");
    } else {
      console.log("Login failed: incorrect credentials");
      toast({
        title: "Помилка входу",
        description: "Неправильне ім'я користувача або пароль",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вхід в адмін панель</CardTitle>
          <CardDescription>
            Введіть свої дані для доступу до панелі адміністратора
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Ім'я користувача</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Вхід..." : "Увійти"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
