import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, User, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

const changeCredentialsSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа").optional(),
  email: z.string().email("Некорректный email").optional(),
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type ChangeCredentialsForm = z.infer<typeof changeCredentialsSchema>;

interface AdminCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: number;
  currentUsername: string;
  currentEmail?: string;
}

export default function AdminCredentialsModal({
  isOpen,
  onClose,
  adminId,
  currentUsername,
  currentEmail
}: AdminCredentialsModalProps) {
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const credentialsForm = useForm<ChangeCredentialsForm>({
    resolver: zodResolver(changeCredentialsSchema),
    defaultValues: {
      username: currentUsername,
      email: currentEmail || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onChangePassword = async (data: ChangePasswordForm) => {
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", `/api/admin/change-password?adminId=${adminId}`, data);
      
      if (response.ok) {
        toast({
          title: "Успех",
          description: "Пароль успешно изменен",
        });
        passwordForm.reset();
        onClose();
      } else {
        const errorData = await response.json();
        toast({
          title: "Ошибка",
          description: errorData.message || "Ошибка при смене пароля",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка подключения к серверу",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeCredentials = async (data: ChangeCredentialsForm) => {
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", `/api/admin/change-credentials?adminId=${adminId}`, data);
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Успех",
          description: "Учетные данные успешно обновлены",
        });
        
        // Update localStorage with new admin data
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          const admin = JSON.parse(storedAdmin);
          admin.username = result.admin.username;
          admin.email = result.admin.email;
          localStorage.setItem("admin", JSON.stringify(admin));
        }
        
        credentialsForm.reset();
        onClose();
        // Reload page to reflect changes
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          title: "Ошибка",
          description: errorData.message || "Ошибка при смене учетных данных",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка подключения к серверу",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Управление учетными данными
          </DialogTitle>
          <DialogDescription>
            Изменение пароля и учетных данных администратора
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Смена пароля</TabsTrigger>
            <TabsTrigger value="credentials">Учетные данные</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4">
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showPasswords.currentPassword ? "text" : "password"}
                    placeholder="Введите текущий пароль"
                    className="pl-10 pr-10"
                    {...passwordForm.register("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.currentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    placeholder="Введите новый пароль"
                    className="pl-10 pr-10"
                    {...passwordForm.register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    placeholder="Подтвердите новый пароль"
                    className="pl-10 pr-10"
                    {...passwordForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Изменить пароль"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4">
            <form onSubmit={credentialsForm.handleSubmit(onChangeCredentials)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Введите новое имя пользователя"
                    className="pl-10"
                    {...credentialsForm.register("username")}
                  />
                </div>
                {credentialsForm.formState.errors.username && (
                  <p className="text-sm text-red-600">
                    {credentialsForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (опционально)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Введите email"
                  {...credentialsForm.register("email")}
                />
                {credentialsForm.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {credentialsForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="credCurrentPassword">Текущий пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="credCurrentPassword"
                    type="password"
                    placeholder="Введите текущий пароль для подтверждения"
                    className="pl-10"
                    {...credentialsForm.register("currentPassword")}
                  />
                </div>
                {credentialsForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600">
                    {credentialsForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="credNewPassword">Новый пароль (опционально)</Label>
                <Input
                  id="credNewPassword"
                  type="password"
                  placeholder="Оставьте пустым, если не хотите менять"
                  {...credentialsForm.register("newPassword")}
                />
                {credentialsForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {credentialsForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {credentialsForm.watch("newPassword") && (
                <div className="space-y-2">
                  <Label htmlFor="credConfirmPassword">Подтверждение нового пароля</Label>
                  <Input
                    id="credConfirmPassword"
                    type="password"
                    placeholder="Подтвердите новый пароль"
                    {...credentialsForm.register("confirmPassword")}
                  />
                  {credentialsForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {credentialsForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Обновить данные"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}