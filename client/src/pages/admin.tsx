import { useState, useEffect } from "react";
import { CMSPanel } from "@/components/cms-panel";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const adminData = localStorage.getItem("admin");
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin && admin.id) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("admin");
        }
      } catch (error) {
        localStorage.removeItem("admin");
      }
    }
    setIsLoading(false);
  }, []);

  const handleClose = () => {
    setLocation("/");
  };

  const handleLogin = () => {
    setLocation("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <CardTitle className="text-2xl font-bold">
              Доступ ограничен
            </CardTitle>
            <CardDescription>
              Для доступа к панели управления необходимо войти в систему
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Войти в админку
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CMSPanel isOpen={true} onClose={handleClose} />;
}