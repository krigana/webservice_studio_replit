import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Save, Upload, Eye, EyeOff, Image as ImageIcon, X } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useNotifications } from "@/components/notification-system";
import type { 
  Project, 
  InsertProject, 
  Service, 
  InsertService, 
  BlogPost, 
  InsertBlogPost, 
  Contact,
  SiteSettings,
  InsertSiteSettings
} from "@shared/schema";
import { 
  insertProjectSchema, 
  insertServiceSchema, 
  insertBlogPostSchema,
  insertSiteSettingsSchema 
} from "@shared/schema";

interface CMSPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Extended schemas with optional translations
const projectFormSchema = insertProjectSchema.extend({
  titleUk: z.string().optional(),
  descriptionUk: z.string().optional(),
  titleRu: z.string().optional(),
  descriptionRu: z.string().optional(),
  titleEn: z.string().optional(),
  descriptionEn: z.string().optional(),
});

const serviceFormSchema = insertServiceSchema.extend({
  titleUk: z.string().optional(),
  descriptionUk: z.string().optional(),
  featuresUk: z.array(z.string()).optional(),
  titleRu: z.string().optional(),
  descriptionRu: z.string().optional(),
  featuresRu: z.array(z.string()).optional(),
  titleEn: z.string().optional(),
  descriptionEn: z.string().optional(),
  featuresEn: z.array(z.string()).optional(),
});

const blogPostFormSchema = insertBlogPostSchema.extend({
  titleUk: z.string().optional(),
  excerptUk: z.string().optional(),
  contentUk: z.string().optional(),
  titleRu: z.string().optional(),
  excerptRu: z.string().optional(),
  contentRu: z.string().optional(),
  titleEn: z.string().optional(),
  excerptEn: z.string().optional(),
  contentEn: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;
type ServiceFormData = z.infer<typeof serviceFormSchema>;
type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

export function CMSPanel({ isOpen, onClose }: CMSPanelProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Data queries
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/admin/projects"],
    queryFn: getQueryFn,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/admin/services"],
    queryFn: getQueryFn,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["/api/admin/blog"],
    queryFn: getQueryFn,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: getQueryFn,
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: getQueryFn,
  });

  // Forms
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      link: "",
      technologies: [],
      visible: true,
    },
  });

  const serviceForm = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      features: [],
      visible: true,
    },
  });

  const blogPostForm = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
      published: false,
    },
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("POST", "/api/admin/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      projectForm.reset();
      addNotification("Проект успешно создан!", "success");
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: InsertService) => apiRequest("POST", "/api/admin/services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      serviceForm.reset();
      addNotification("Услуга успешно создана!", "success");
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => apiRequest("POST", "/api/admin/blog", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      blogPostForm.reset();
      addNotification("Статья успешно создана!", "success");
    },
  });

  // Event handlers
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description,
      image: project.image || "",
      link: project.link || "",
      technologies: project.technologies || [],
      visible: project.visible,
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    serviceForm.reset({
      title: service.title,
      description: service.description,
      icon: service.icon || "",
      features: service.features || [],
      visible: service.visible,
    });
  };

  const toggleProjectVisibility = (project: Project) => {
    apiRequest("PUT", `/api/admin/projects/${project.id}`, {
      visible: !project.visible,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      addNotification(
        project.visible ? "Проект скрыт" : "Проект показан",
        "success"
      );
    });
  };

  const toggleServiceVisibility = (service: Service) => {
    apiRequest("PUT", `/api/admin/services/${service.id}`, {
      visible: !service.visible,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      addNotification(
        service.visible ? "Услуга скрыта" : "Услуга показана",
        "success"
      );
    });
  };

  const handleEditBlogPost = (blogPost: BlogPost) => {
    setEditingBlogPost(blogPost);
    blogPostForm.reset({
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt || "",
      content: blogPost.content,
      image: blogPost.image || "",
      published: blogPost.published,
    });
  };

  const toggleBlogPostPublication = (blogPost: BlogPost) => {
    apiRequest("PUT", `/api/admin/blog/${blogPost.id}`, {
      published: !blogPost.published,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      addNotification(
        blogPost.published ? "Статья снята с публикации" : "Статья опубликована",
        "success"
      );
    });
  };

  const handleBlogImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/admin/upload/blog-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      addNotification("Ошибка загрузки изображения", "error");
      throw error;
    }
  };

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await fetch('/api/admin/upload/logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.logoUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      addNotification("Ошибка загрузки логотипа", "error");
      throw error;
    }
  };

  const onSubmitProject = (data: ProjectFormData) => {
    const projectData: InsertProject = {
      title: data.title,
      description: data.description,
      image: data.image,
      link: data.link,
      technologies: data.technologies,
      visible: data.visible,
    };

    if (editingProject) {
      apiRequest("PUT", `/api/admin/projects/${editingProject.id}`, projectData).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        setEditingProject(null);
        projectForm.reset();
        addNotification("Проект обновлен!", "success");
      });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const onSubmitService = (data: ServiceFormData) => {
    const serviceData: InsertService = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      features: data.features,
      visible: data.visible,
    };

    if (editingService) {
      apiRequest("PUT", `/api/admin/services/${editingService.id}`, serviceData).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
        queryClient.invalidateQueries({ queryKey: ["/api/services"] });
        setEditingService(null);
        serviceForm.reset();
        addNotification("Услуга обновлена!", "success");
      });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  const onSubmitBlogPost = (data: BlogPostFormData) => {
    const blogData: InsertBlogPost = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      published: data.published,
    };

    if (editingBlogPost) {
      apiRequest("PUT", `/api/admin/blog/${editingBlogPost.id}`, blogData).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
        queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
        setEditingBlogPost(null);
        blogPostForm.reset();
        addNotification("Статья обновлена!", "success");
      });
    } else {
      createBlogPostMutation.mutate(blogData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Панель управления контентом</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">Проекты</TabsTrigger>
              <TabsTrigger value="services">Услуги</TabsTrigger>
              <TabsTrigger value="blog">Блог</TabsTrigger>
              <TabsTrigger value="contacts">Контакты</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProject ? "Редактировать проект" : "Добавить проект"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...projectForm}>
                    <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
                      <FormField
                        control={projectForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4">
                        <Button type="submit" disabled={createProjectMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingProject ? "Обновить" : "Создать"}
                        </Button>
                        {editingProject && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingProject(null);
                              projectForm.reset();
                            }}
                          >
                            Отмена
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Существующие проекты</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project: Project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.description}</p>
                          <Badge variant={project.visible ? "default" : "secondary"}>
                            {project.visible ? "Видимый" : "Скрытый"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleProjectVisibility(project)}
                          >
                            {project.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProject(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Similar structure for other tabs */}
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Сообщения от клиентов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contacts.map((contact: Contact) => (
                      <div key={contact.id} className="p-4 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{contact.name}</h3>
                            <p className="text-sm text-gray-600">{contact.phone}</p>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                            <p className="mt-2">{contact.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(contact.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}