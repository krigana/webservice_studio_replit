import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { CustomMenuItem, InsertCustomMenuItem } from "@shared/schema";

const menuItemSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  url: z.string().min(1, "URL обязателен"),
  isExternal: z.boolean().default(false),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuManagementProps {
  settingsForm: any;
}

export function MenuManagement({ settingsForm }: MenuManagementProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomMenuItem | null>(null);

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      title: "",
      url: "",
      isExternal: false,
      order: 0,
      isVisible: true,
    },
  });

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["/api/admin/menu-items"],
  });

  const createMenuItemMutation = useMutation({
    mutationFn: (data: InsertCustomMenuItem) =>
      apiRequest("POST", "/api/admin/menu-items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      toast({
        title: "Пункт меню создан",
        description: "Новый пункт меню был успешно добавлен.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertCustomMenuItem> }) =>
      apiRequest("PATCH", `/api/admin/menu-items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      toast({
        title: "Пункт меню обновлен",
        description: "Изменения были успешно сохранены.",
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      toast({
        title: "Пункт меню удален",
        description: "Пункт меню был успешно удален.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MenuItemFormData) => {
    if (editingItem) {
      updateMenuItemMutation.mutate({
        id: editingItem.id,
        data,
      });
    } else {
      createMenuItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: CustomMenuItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      url: item.url,
      isExternal: item.isExternal,
      order: item.order,
      isVisible: item.isVisible,
    });
    setIsDialogOpen(true);
  };

  const toggleVisibility = (item: CustomMenuItem) => {
    updateMenuItemMutation.mutate({
      id: item.id,
      data: { isVisible: !item.isVisible },
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Управление навигационным меню
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingItem(null);
                form.reset({
                  title: "",
                  url: "",
                  isExternal: false,
                  order: 0,
                  isVisible: true,
                });
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Добавить пункт
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Standard Menu Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Стандартные пункты меню</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Switch
                  checked={settingsForm?.watch("showServicesMenu") ?? true}
                  onCheckedChange={(checked) => settingsForm?.setValue("showServicesMenu", checked)}
                />
                <Label className="text-sm">Услуги</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Switch
                  checked={settingsForm?.watch("showPortfolioMenu") ?? true}
                  onCheckedChange={(checked) => settingsForm?.setValue("showPortfolioMenu", checked)}
                />
                <Label className="text-sm">Портфолио</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Switch
                  checked={settingsForm?.watch("showAboutMenu") ?? true}
                  onCheckedChange={(checked) => settingsForm?.setValue("showAboutMenu", checked)}
                />
                <Label className="text-sm">О нас</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Switch
                  checked={settingsForm?.watch("showBlogMenu") ?? true}
                  onCheckedChange={(checked) => settingsForm?.setValue("showBlogMenu", checked)}
                />
                <Label className="text-sm">Блог</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Switch
                  checked={settingsForm?.watch("showContactMenu") ?? true}
                  onCheckedChange={(checked) => settingsForm?.setValue("showContactMenu", checked)}
                />
                <Label className="text-sm">Контакты</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Switch
                  checked={settingsForm?.watch("showAdminMenu") ?? false}
                  onCheckedChange={(checked) => settingsForm?.setValue("showAdminMenu", checked)}
                />
                <Label className="text-sm">Админ</Label>
              </div>
            </div>
          </div>

          {/* Custom Menu Items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Пользовательские пункты меню</h4>
            
            {isLoading ? (
              <div className="text-center py-4">Загрузка...</div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Пользовательские пункты меню отсутствуют
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems
                  .sort((a: CustomMenuItem, b: CustomMenuItem) => a.order - b.order)
                  .map((item: CustomMenuItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={item.isVisible}
                          onCheckedChange={() => toggleVisibility(item)}
                        />
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.url}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMenuItemMutation.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for creating/editing menu items */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Редактировать пункт меню" : "Добавить пункт меню"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input placeholder="Название пункта меню" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/страница или https://внешний-сайт.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isExternal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Внешняя ссылка</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Открывать ссылку в новой вкладке
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Порядок</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Видимость</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Показывать пункт в меню
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
                >
                  {editingItem ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}