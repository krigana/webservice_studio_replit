import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { 
  Project, 
  Service, 
  BlogPost, 
  Contact, 
  SiteSettings,
  InsertProject, 
  InsertService, 
  InsertBlogPost 
} from "@shared/schema";
import { 
  insertProjectSchema, 
  insertServiceSchema, 
  insertBlogPostSchema 
} from "@shared/schema";

interface CMSPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CMSPanelClean({ isOpen, onClose }: CMSPanelProps) {
  const { toast } = useToast();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);

  // Forms
  const projectForm = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      technologies: [],
      projectUrl: "",
      isVisible: true,
      order: 0,
    },
  });

  const serviceForm = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "code",
      features: [],
      isVisible: true,
      order: 0,
    },
  });

  const blogForm = useForm<InsertBlogPost>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      isPublished: false,
      order: 0,
    },
  });

  const settingsForm = useForm<Partial<SiteSettings>>({
    defaultValues: {
      aboutTitle: "",
      aboutDescription: "",
      aboutImageUrl: "",
      feature1Title: "",
      feature1Description: "",
      feature1Icon: "rocket",
      feature2Title: "",
      feature2Description: "",
      feature2Icon: "users",
      feature3Title: "",
      feature3Description: "",
      feature3Icon: "award",
    },
  });

  // Queries
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/admin/projects"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/admin/services"],
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["/api/admin/blog"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("POST", "/api/admin/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      projectForm.reset();
      toast({ title: "Проект создан успешно" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProject> }) =>
      apiRequest("PATCH", `/api/admin/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      setEditingProject(null);
      projectForm.reset();
      toast({ title: "Проект обновлен успешно" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Проект удален успешно" });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: InsertService) => apiRequest("POST", "/api/admin/services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsServiceDialogOpen(false);
      serviceForm.reset();
      toast({ title: "Услуга создана успешно" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertService> }) =>
      apiRequest("PATCH", `/api/admin/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsServiceDialogOpen(false);
      setEditingService(null);
      serviceForm.reset();
      toast({ title: "Услуга обновлена успешно" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Услуга удалена успешно" });
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => apiRequest("POST", "/api/admin/blog", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsBlogDialogOpen(false);
      blogForm.reset();
      toast({ title: "Статья создана успешно" });
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBlogPost> }) =>
      apiRequest("PATCH", `/api/admin/blog/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsBlogDialogOpen(false);
      setEditingBlogPost(null);
      blogForm.reset();
      toast({ title: "Статья обновлена успешно" });
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Статья удалена успешно" });
    },
  });

  const updateSiteSettingsMutation = useMutation({
    mutationFn: (data: Partial<SiteSettings>) => 
      apiRequest("PATCH", "/api/site-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({ title: "Настройки сохранены успешно" });
    },
  });

  // Set form defaults when editing
  React.useEffect(() => {
    if (editingProject) {
      projectForm.reset({
        title: editingProject.title,
        description: editingProject.description,
        imageUrl: editingProject.imageUrl,
        technologies: editingProject.technologies,
        projectUrl: editingProject.projectUrl || "",
        isVisible: editingProject.isVisible,
        order: editingProject.order,
      });
    }
  }, [editingProject, projectForm]);

  React.useEffect(() => {
    if (editingService) {
      serviceForm.reset({
        title: editingService.title,
        description: editingService.description,
        icon: editingService.icon,
        features: editingService.features,
        isVisible: editingService.isVisible,
        order: editingService.order,
      });
    }
  }, [editingService, serviceForm]);

  React.useEffect(() => {
    if (editingBlogPost) {
      blogForm.reset({
        title: editingBlogPost.title,
        slug: editingBlogPost.slug,
        excerpt: editingBlogPost.excerpt,
        content: editingBlogPost.content,
        imageUrl: editingBlogPost.imageUrl || "",
        isPublished: editingBlogPost.isPublished,
        order: editingBlogPost.order,
      });
    }
  }, [editingBlogPost, blogForm]);

  React.useEffect(() => {
    if (siteSettings) {
      settingsForm.reset({
        aboutTitle: siteSettings.aboutTitle || "",
        aboutDescription: siteSettings.aboutDescription || "",
        aboutImageUrl: siteSettings.aboutImageUrl || "",
        feature1Title: siteSettings.feature1Title || "",
        feature1Description: siteSettings.feature1Description || "",
        feature1Icon: siteSettings.feature1Icon || "rocket",
        feature2Title: siteSettings.feature2Title || "",
        feature2Description: siteSettings.feature2Description || "",
        feature2Icon: siteSettings.feature2Icon || "users",
        feature3Title: siteSettings.feature3Title || "",
        feature3Description: siteSettings.feature3Description || "",
        feature3Icon: siteSettings.feature3Icon || "award",
      });
    }
  }, [siteSettings, settingsForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Панель управления сайтом</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs defaultValue="projects" className="p-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">Проекты</TabsTrigger>
              <TabsTrigger value="services">Услуги</TabsTrigger>
              <TabsTrigger value="blog">Блог</TabsTrigger>
              <TabsTrigger value="about">О нас</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Управление проектами</h3>
                <Button onClick={() => { setEditingProject(null); projectForm.reset(); setIsProjectDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить проект
                </Button>
              </div>
              
              <div className="grid gap-4">
                {(projects as Project[]).map((project: Project) => (
                  <Card key={project.id}>
                    <CardContent className="flex justify-between items-center p-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-gray-600">{project.description}</p>
                          <Badge variant={project.isVisible ? "default" : "secondary"}>
                            {project.isVisible ? "Видимый" : "Скрытый"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProject(project);
                            setIsProjectDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateProjectMutation.mutate({
                              id: project.id,
                              data: { isVisible: !project.isVisible }
                            });
                          }}
                        >
                          {project.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Удалить проект?")) {
                              deleteProjectMutation.mutate(project.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <h3 className="text-xl font-semibold">Раздел "О нас"</h3>
              
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit((data) => updateSiteSettingsMutation.mutate(data))} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Основная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="aboutTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Заголовок</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Заголовок раздела" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="aboutDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Описание команды" rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="aboutImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Изображение команды</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="URL изображения" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Карточки особенностей</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Feature 1 */}
                      <div className="border p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Карточка 1</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="feature1Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Заголовок карточки" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={settingsForm.control}
                            name="feature1Icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Иконка</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="rocket">Ракета</SelectItem>
                                    <SelectItem value="users">Пользователи</SelectItem>
                                    <SelectItem value="award">Награда</SelectItem>
                                    <SelectItem value="star">Звезда</SelectItem>
                                    <SelectItem value="heart">Сердце</SelectItem>
                                    <SelectItem value="shield">Щит</SelectItem>
                                    <SelectItem value="target">Цель</SelectItem>
                                    <SelectItem value="zap">Молния</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="feature1Description"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Описание карточки" rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Feature 2 */}
                      <div className="border p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Карточка 2</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="feature2Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Заголовок карточки" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={settingsForm.control}
                            name="feature2Icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Иконка</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="rocket">Ракета</SelectItem>
                                    <SelectItem value="users">Пользователи</SelectItem>
                                    <SelectItem value="award">Награда</SelectItem>
                                    <SelectItem value="star">Звезда</SelectItem>
                                    <SelectItem value="heart">Сердце</SelectItem>
                                    <SelectItem value="shield">Щит</SelectItem>
                                    <SelectItem value="target">Цель</SelectItem>
                                    <SelectItem value="zap">Молния</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="feature2Description"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Описание карточки" rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Feature 3 */}
                      <div className="border p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Карточка 3</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="feature3Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Заголовок карточки" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={settingsForm.control}
                            name="feature3Icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Иконка</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="rocket">Ракета</SelectItem>
                                    <SelectItem value="users">Пользователи</SelectItem>
                                    <SelectItem value="award">Награда</SelectItem>
                                    <SelectItem value="star">Звезда</SelectItem>
                                    <SelectItem value="heart">Сердце</SelectItem>
                                    <SelectItem value="shield">Щит</SelectItem>
                                    <SelectItem value="target">Цель</SelectItem>
                                    <SelectItem value="zap">Молния</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="feature3Description"
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Описание карточки" rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full">
                    Сохранить изменения
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Редактировать проект" : "Новый проект"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit((data) => {
              if (editingProject) {
                updateProjectMutation.mutate({ id: editingProject.id, data });
              } else {
                createProjectMutation.mutate(data);
              }
            })} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Название проекта" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Описание проекта" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL проекта</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">
                  {editingProject ? "Обновить" : "Создать"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}