import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Users, Upload, Check, Eye, EyeOff, GripVertical } from "lucide-react";
import { insertTeamMemberSchema, type TeamMember, type InsertTeamMember } from "@shared/schema";

const teamMemberFormSchema = insertTeamMemberSchema.extend({
  imageFile: z.any().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;

interface TeamManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamManagement({ isOpen, onClose }: TeamManagementProps) {
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/team"],
  });

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      position: "",
      description: "",
      imageUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      emailUrl: "",
      isVisible: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      // Automatically translate to other languages
      const translations = await Promise.all([
        apiRequest("POST", "/api/translate", { text: data.name, targetLanguage: "uk" }),
        apiRequest("POST", "/api/translate", { text: data.name, targetLanguage: "ru" }),
        apiRequest("POST", "/api/translate", { text: data.name, targetLanguage: "en" }),
        apiRequest("POST", "/api/translate", { text: data.position, targetLanguage: "uk" }),
        apiRequest("POST", "/api/translate", { text: data.position, targetLanguage: "ru" }),
        apiRequest("POST", "/api/translate", { text: data.position, targetLanguage: "en" }),
        data.description ? apiRequest("POST", "/api/translate", { text: data.description, targetLanguage: "uk" }) : null,
        data.description ? apiRequest("POST", "/api/translate", { text: data.description, targetLanguage: "ru" }) : null,
        data.description ? apiRequest("POST", "/api/translate", { text: data.description, targetLanguage: "en" }) : null,
      ]);

      const translatedData = {
        ...data,
        nameUk: translations[0]?.translatedText || data.name,
        nameRu: translations[1]?.translatedText || data.name,
        nameEn: translations[2]?.translatedText || data.name,
        positionUk: translations[3]?.translatedText || data.position,
        positionRu: translations[4]?.translatedText || data.position,
        positionEn: translations[5]?.translatedText || data.position,
        descriptionUk: translations[6]?.translatedText || data.description || "",
        descriptionRu: translations[7]?.translatedText || data.description || "",
        descriptionEn: translations[8]?.translatedText || data.description || "",
      };

      return apiRequest("POST", "/api/admin/team", translatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      toast({
        title: "Успіх",
        description: "Член команди успішно створений з автоматичним перекладом",
      });
      form.reset();
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося створити члена команди",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTeamMember> }) => {
      // If name, position, or description changed, update translations
      const needsTranslation = data.name || data.position || data.description;
      if (needsTranslation) {
        const translations = await Promise.all([
          data.name ? apiRequest("POST", "/api/translate", { text: data.name, targetLanguage: "uk" }) : null,
          data.name ? apiRequest("POST", "/api/translate", { text: data.name, targetLanguage: "ru" }) : null,
          data.name ? apiRequest("POST", "/api/translate", { text: data.name, targetLanguage: "en" }) : null,
          data.position ? apiRequest("POST", "/api/translate", { text: data.position, targetLanguage: "uk" }) : null,
          data.position ? apiRequest("POST", "/api/translate", { text: data.position, targetLanguage: "ru" }) : null,
          data.position ? apiRequest("POST", "/api/translate", { text: data.position, targetLanguage: "en" }) : null,
          data.description ? apiRequest("POST", "/api/translate", { text: data.description, targetLanguage: "uk" }) : null,
          data.description ? apiRequest("POST", "/api/translate", { text: data.description, targetLanguage: "ru" }) : null,
          data.description ? apiRequest("POST", "/api/translate", { text: data.description, targetLanguage: "en" }) : null,
        ]);

        const translatedData = {
          ...data,
          ...(data.name && {
            nameUk: translations[0]?.translatedText,
            nameRu: translations[1]?.translatedText,
            nameEn: translations[2]?.translatedText,
          }),
          ...(data.position && {
            positionUk: translations[3]?.translatedText,
            positionRu: translations[4]?.translatedText,
            positionEn: translations[5]?.translatedText,
          }),
          ...(data.description && {
            descriptionUk: translations[6]?.translatedText,
            descriptionRu: translations[7]?.translatedText,
            descriptionEn: translations[8]?.translatedText,
          }),
        };

        return apiRequest("PUT", `/api/admin/team/${id}`, translatedData);
      }

      return apiRequest("PUT", `/api/admin/team/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      toast({
        title: "Успіх",
        description: "Член команди успішно оновлений",
      });
      form.reset();
      setEditingMember(null);
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити члена команди",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/team/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      toast({
        title: "Успіх",
        description: "Член команди успішно видалений",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося видалити члена команди",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: number; isVisible: boolean }) =>
      apiRequest("PATCH", `/api/admin/team/${id}/visibility`, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      toast({
        title: "Успіх",
        description: "Видимість члена команди оновлена",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити видимість",
        variant: "destructive",
      });
    },
  });

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      position: member.position,
      description: member.description || "",
      imageUrl: member.imageUrl || "",
      linkedinUrl: member.linkedinUrl || "",
      githubUrl: member.githubUrl || "",
      emailUrl: member.emailUrl || "",
      isVisible: member.isVisible,
      order: member.order,
    });
    setIsFormOpen(true);
  };

  const handleCreateMember = () => {
    setEditingMember(null);
    form.reset({
      name: "",
      position: "",
      description: "",
      imageUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      emailUrl: "",
      isVisible: true,
      order: teamMembers.length,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: TeamMemberFormData) => {
    const { imageFile, ...memberData } = data;
    
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: memberData });
    } else {
      createMutation.mutate(memberData);
    }
  };

  const toggleMemberVisibility = (member: TeamMember) => {
    toggleVisibilityMutation.mutate({
      id: member.id,
      isVisible: !member.isVisible,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-600" />
            <h2 className="text-2xl font-bold">Управління командою</h2>
          </div>
          <Button variant="outline" onClick={onClose}>
            Закрити
          </Button>
        </div>

        <div className="mb-6">
          <Button onClick={handleCreateMember} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Додати члена команди
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Завантаження...</div>
        ) : (
          <div className="grid gap-4">
            {teamMembers.map((member: TeamMember) => (
              <Card key={member.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <Badge variant={member.isVisible ? "default" : "secondary"}>
                          {member.isVisible ? "Видимий" : "Прихований"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm font-medium text-cyan-600">
                        {member.position}
                      </CardDescription>
                      {member.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {member.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMemberVisibility(member)}
                        disabled={toggleVisibilityMutation.isPending}
                      >
                        {member.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(member.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {(member.imageUrl || member.linkedinUrl || member.githubUrl || member.emailUrl) && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {member.imageUrl && <span>Фото: ✓</span>}
                      {member.linkedinUrl && <span>LinkedIn: ✓</span>}
                      {member.githubUrl && <span>GitHub: ✓</span>}
                      {member.emailUrl && <span>Email: ✓</span>}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Редагувати члена команди" : "Додати члена команди"}
              </DialogTitle>
              <DialogDescription>
                Заповніть форму нижче. Переклади будуть створені автоматично.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ім'я *</FormLabel>
                        <FormControl>
                          <Input placeholder="Введіть ім'я" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Посада *</FormLabel>
                        <FormControl>
                          <Input placeholder="Введіть посаду" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Опис</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Введіть опис члена команди" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL фото</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/photo.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://linkedin.com/in/..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://github.com/..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="user@example.com" 
                            type="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Порядок відображення</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Видимий на сайті</FormLabel>
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
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Скасувати
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingMember ? "Оновити" : "Створити"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}