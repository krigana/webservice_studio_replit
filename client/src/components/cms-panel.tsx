import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Image, MessageCircle, Search, Share2, BarChart3, Settings, FileText, Code, AlertTriangle, Key, LogOut } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useNotifications } from "@/components/notification-system";
import { MenuManagement } from "@/components/menu-management";
import AdminCredentialsModal from "@/components/admin-credentials-modal";
import { insertProjectSchema, insertServiceSchema, insertBlogPostSchema, insertSiteSettingsSchema } from "@shared/schema";
import type { InsertProject, Project, InsertService, Service, InsertBlogPost, BlogPost, InsertSiteSettings, SiteSettings } from "@shared/schema";
// Тимчасово замінюємо ReactQuill на простий textarea для збірки
const ReactQuill = ({ value, onChange, placeholder }: any) => (
  <textarea 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full min-h-[200px] p-3 border rounded-md"
  />
);

interface CMSPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CMSPanel({ isOpen, onClose }: CMSPanelProps) {
  // Check URL parameter for initial tab
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'projects';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Функция для удаления HTML-тегов из текста
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isBlogPostDialogOpen, setIsBlogPostDialogOpen] = useState(false);
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
  const [uploadingTeamImage, setUploadingTeamImage] = useState(false);
  
  // Admin управление
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [adminData, setAdminData] = useState(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });
  
  // SEO состояния
  const [activeSeoSection, setActiveSeoSection] = useState<'services' | 'projects' | 'blog' | null>(null);
  const [activeSeoItemId, setActiveSeoItemId] = useState<number | null>(null);
  
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Admin функции
  const handleLogout = () => {
    localStorage.removeItem("admin");
    setAdminData(null);
    onClose();
    window.location.href = "/admin/login";
  };

  // Update tab when URL changes and clear URL parameter
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
      // Clear the tab parameter from URL
      if (tabParam) {
        urlParams.delete('tab');
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [isOpen, activeTab]);

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
  });

  const { data: blogPosts = [], isLoading: blogPostsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
  });

  const { data: siteSettings, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  // Widget feedback contacts (only widget messages)
  const { data: widgetFeedback = [], isLoading: widgetFeedbackLoading } = useQuery({
    queryKey: ["/api/admin/widget-feedback"],
  });

  // Project form
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

  // Service form
  const serviceForm = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      features: [],
      isVisible: true,
      order: 0,
    },
  });

  // Blog post form
  const blogPostForm = useForm<InsertBlogPost>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      tags: [],
      isPublished: false,
    },
  });

  // Site settings form
  const settingsForm = useForm<InsertSiteSettings>({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      phone: "",
      email: "",
      address: "",
      facebookUrl: "",
      facebookVisible: true,
      instagramUrl: "",
      instagramVisible: true,
      youtubeUrl: "",
      youtubeVisible: true,
      telegramUrl: "",
      telegramVisible: true,
      githubUrl: "",
      githubVisible: true,
      linkedinUrl: "",
      linkedinVisible: true,
      footerDescription: "",
      companyName: "",
      logoUrl: "",
      aboutTitle: "",
      aboutDescription: "",
      aboutImageUrl: "",
      feature1Title: "",
      feature1Description: "",
      feature2Title: "",
      feature2Description: "",
      feature3Title: "",
      feature3Description: "",
    },
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("POST", "/api/admin/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      addNotification({ type: 'success', title: 'Проект создан', message: 'Новый проект успешно добавлен' });
      setIsProjectDialogOpen(false);
      projectForm.reset();
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProject> }) =>
      apiRequest("PATCH", `/api/admin/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      addNotification({ type: 'success', title: 'Проект обновлен', message: 'Изменения сохранены' });
      setEditingProject(null);
      setIsProjectDialogOpen(false);
      projectForm.reset();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      addNotification({ type: 'success', title: 'Проект удален', message: 'Проект успешно удален' });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: InsertService) => apiRequest("POST", "/api/admin/services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      addNotification({ type: 'success', title: 'Услуга создана', message: 'Новая услуга успешно добавлена' });
      setIsServiceDialogOpen(false);
      serviceForm.reset();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertService> }) =>
      apiRequest("PATCH", `/api/admin/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      addNotification({ type: 'success', title: 'Услуга обновлена', message: 'Изменения сохранены' });
      setEditingService(null);
      setIsServiceDialogOpen(false);
      serviceForm.reset();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      addNotification({ type: 'success', title: 'Услуга удалена', message: 'Услуга успешно удалена' });
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: (data: InsertBlogPost) => apiRequest("POST", "/api/admin/blog", data),
    onSuccess: () => {
      // Принудительно обновляем кэш блога
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.refetchQueries({ queryKey: ["/api/blog"] });
      addNotification({ type: 'success', title: 'Статья создана', message: 'Новая статья успешно добавлена' });
      setIsBlogPostDialogOpen(false);
      blogPostForm.reset();
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBlogPost> }) =>
      apiRequest("PATCH", `/api/admin/blog/${id}`, data),
    onSuccess: (_, variables) => {
      // Принудительно обновляем кэш блога
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.removeQueries({ queryKey: ["/api/blog"] });
      
      // Инвалидируем все связанные с блогом запросы
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey.some(key => 
            typeof key === 'string' && key.includes('/api/blog')
          );
        }
      });
      
      queryClient.refetchQueries({ queryKey: ["/api/blog"] });
      addNotification({ type: 'success', title: 'Статья обновлена', message: 'Изменения сохранены' });
      setEditingBlogPost(null);
      setIsBlogPostDialogOpen(false);
      blogPostForm.reset();
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/blog/${id}`),
    onSuccess: () => {
      // Принудительно обновляем кэш блога
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.refetchQueries({ queryKey: ["/api/blog"] });
      addNotification({ type: 'success', title: 'Статья удалена', message: 'Статья успешно удалена' });
    },
  });

  const updateSiteSettingsMutation = useMutation({
    mutationFn: (data: Partial<InsertSiteSettings>) => apiRequest("PUT", "/api/admin/site-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      addNotification({ type: 'success', title: 'Настройки сохранены', message: 'Настройки сайта успешно обновлены' });
    },
  });

  const markFeedbackAsReadMutation = useMutation({
    mutationFn: (feedbackId: number) => apiRequest("PATCH", `/api/admin/contacts/${feedbackId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/widget-feedback"] });
      addNotification({ type: 'success', title: 'Отзыв отмечен', message: 'Отзыв отмечен как прочитанный' });
    },
  });

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      technologies: project.technologies,
      projectUrl: project.projectUrl || "",
      isVisible: project.isVisible,
      order: project.order,
    });
    setIsProjectDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    serviceForm.reset({
      title: service.title,
      description: service.description,
      icon: service.icon,
      features: service.features,
      isVisible: service.isVisible,
      order: service.order,
    });
    setIsServiceDialogOpen(true);
  };

  const toggleProjectVisibility = (project: Project) => {
    updateProjectMutation.mutate({
      id: project.id,
      data: { isVisible: !project.isVisible }
    });
  };

  const toggleServiceVisibility = (service: Service) => {
    updateServiceMutation.mutate({
      id: service.id,
      data: { isVisible: !service.isVisible }
    });
  };

  const handleEditBlogPost = (blogPost: BlogPost) => {
    setEditingBlogPost(blogPost);
    blogPostForm.reset({
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      imageUrl: blogPost.imageUrl,
      tags: blogPost.tags,
      isPublished: blogPost.isPublished,
    });
    setIsBlogPostDialogOpen(true);
  };

  const toggleBlogPostPublication = (blogPost: BlogPost) => {
    updateBlogPostMutation.mutate({
      id: blogPost.id,
      data: { isPublished: !blogPost.isPublished }
    });
  };

  const handleBlogImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingBlogImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/blog-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображения');
      }

      const { imageUrl } = await response.json();
      blogPostForm.setValue('imageUrl', imageUrl);
      addNotification({ 
        type: 'success', 
        title: 'Изображение загружено', 
        message: 'Изображение успешно загружено и добавлено к статье' 
      });
    } catch (error) {
      addNotification({ 
        type: 'error', 
        title: 'Ошибка загрузки', 
        message: 'Не удалось загрузить изображение. Попробуйте еще раз.' 
      });
    } finally {
      setUploadingBlogImage(false);
    }
  };



  const handleTeamImageUpload = async (file: File, field: any) => {
    if (!file) return;

    setUploadingTeamImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/team-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображения команды');
      }

      const { imageUrl } = await response.json();
      field.onChange(imageUrl);
      addNotification({ 
        type: 'success', 
        title: 'Изображение команды загружено', 
        message: 'Изображение успешно загружено' 
      });
    } catch (error) {
      addNotification({ 
        type: 'error', 
        title: 'Ошибка загрузки', 
        message: 'Не удалось загрузить изображение команды. Попробуйте еще раз.' 
      });
    } finally {
      setUploadingTeamImage(false);
    }
  };

  // Load site settings into form when data is available
  useEffect(() => {
    if (siteSettings && !settingsForm.formState.isDirty) {
      settingsForm.reset({
        phone: siteSettings.phone || "",
        email: siteSettings.email || "",
        address: siteSettings.address || "",
        facebookUrl: siteSettings.facebookUrl || "",
        facebookVisible: siteSettings.facebookVisible ?? true,
        instagramUrl: siteSettings.instagramUrl || "",
        instagramVisible: siteSettings.instagramVisible ?? true,
        youtubeUrl: siteSettings.youtubeUrl || "",
        youtubeVisible: siteSettings.youtubeVisible ?? true,
        telegramUrl: siteSettings.telegramUrl || "",
        telegramVisible: siteSettings.telegramVisible ?? true,
        githubUrl: siteSettings.githubUrl || "",
        githubVisible: siteSettings.githubVisible ?? true,
        linkedinUrl: siteSettings.linkedinUrl || "",
        linkedinVisible: siteSettings.linkedinVisible ?? true,
        footerDescription: siteSettings.footerDescription || "",
        companyName: siteSettings.companyName || "",
        logoUrl: siteSettings.logoUrl || "",
        // Hero content fields
        heroTitle1Uk: siteSettings.heroTitle1Uk || "",
        heroTitle1Ru: siteSettings.heroTitle1Ru || "",
        heroTitle1En: siteSettings.heroTitle1En || "",
        heroTitle2Uk: siteSettings.heroTitle2Uk || "",
        heroTitle2Ru: siteSettings.heroTitle2Ru || "",
        heroTitle2En: siteSettings.heroTitle2En || "",
        heroTitle3Uk: siteSettings.heroTitle3Uk || "",
        heroTitle3Ru: siteSettings.heroTitle3Ru || "",
        heroTitle3En: siteSettings.heroTitle3En || "",
        heroDescriptionUk: siteSettings.heroDescriptionUk || "",
        heroDescriptionRu: siteSettings.heroDescriptionRu || "",
        heroDescriptionEn: siteSettings.heroDescriptionEn || "",
        // Header/Navigation settings
        showServicesMenu: siteSettings.showServicesMenu ?? true,
        showPortfolioMenu: siteSettings.showPortfolioMenu ?? true,
        showAboutMenu: siteSettings.showAboutMenu ?? true,
        showContactMenu: siteSettings.showContactMenu ?? true,
        showBlogMenu: siteSettings.showBlogMenu ?? true,
        showAdminMenu: siteSettings.showAdminMenu ?? true,
        // Menu labels translations
        servicesMenuUk: siteSettings.servicesMenuUk || "",
        servicesMenuRu: siteSettings.servicesMenuRu || "",
        servicesMenuEn: siteSettings.servicesMenuEn || "",
        portfolioMenuUk: siteSettings.portfolioMenuUk || "",
        portfolioMenuRu: siteSettings.portfolioMenuRu || "",
        portfolioMenuEn: siteSettings.portfolioMenuEn || "",
        aboutMenuUk: siteSettings.aboutMenuUk || "",
        aboutMenuRu: siteSettings.aboutMenuRu || "",
        aboutMenuEn: siteSettings.aboutMenuEn || "",
        contactMenuUk: siteSettings.contactMenuUk || "",
        contactMenuRu: siteSettings.contactMenuRu || "",
        contactMenuEn: siteSettings.contactMenuEn || "",
        blogMenuUk: siteSettings.blogMenuUk || "",
        blogMenuRu: siteSettings.blogMenuRu || "",
        blogMenuEn: siteSettings.blogMenuEn || "",
        adminMenuUk: siteSettings.adminMenuUk || "",
        adminMenuRu: siteSettings.adminMenuRu || "",
        adminMenuEn: siteSettings.adminMenuEn || "",
        // New simplified menu fields
        aboutMenu: siteSettings.aboutMenu || "Про нас",
        contactMenu: siteSettings.contactMenu || "Контакти", 
        blogMenu: siteSettings.blogMenu || "Блог",
        adminMenu: siteSettings.adminMenu || "Адмін",
        // About section fields
        aboutTitle: siteSettings.aboutTitle || "",
        aboutDescription: siteSettings.aboutDescription || "",
        aboutImageUrl: siteSettings.aboutImageUrl || "",
        feature1Title: siteSettings.feature1Title || "",
        feature1Description: siteSettings.feature1Description || "",
        feature2Title: siteSettings.feature2Title || "",
        feature2Description: siteSettings.feature2Description || "",
        feature3Title: siteSettings.feature3Title || "",
        feature3Description: siteSettings.feature3Description || "",
        // SEO settings
        siteTitle: siteSettings.siteTitle || "",
        siteDescription: siteSettings.siteDescription || "",
        siteKeywords: siteSettings.siteKeywords || "",
        siteAuthor: siteSettings.siteAuthor || "",
        siteUrl: siteSettings.siteUrl || "",
        ogTitle: siteSettings.ogTitle || "",
        ogDescription: siteSettings.ogDescription || "",
        ogImage: siteSettings.ogImage || "",
        ogType: siteSettings.ogType || "website",
        twitterCard: siteSettings.twitterCard || "summary_large_image",
        twitterSite: siteSettings.twitterSite || "",
        twitterCreator: siteSettings.twitterCreator || "",
        robots: siteSettings.robots || "index, follow",
        canonical: siteSettings.canonical || "",
        googleAnalyticsId: siteSettings.googleAnalyticsId || "",
        googleTagManagerId: siteSettings.googleTagManagerId || "",
        facebookPixelId: siteSettings.facebookPixelId || "",
        // Cookie settings
        cookieConsentEnabled: siteSettings.cookieConsentEnabled ?? true,
        cookieTitle: siteSettings.cookieTitle || "",
        cookieMessage: siteSettings.cookieMessage || "",
        cookieAcceptText: siteSettings.cookieAcceptText || "",
        cookieDeclineText: siteSettings.cookieDeclineText || "",
        cookieSettingsText: siteSettings.cookieSettingsText || "",
        cookiePolicyUrl: siteSettings.cookiePolicyUrl || "",
        cookiePosition: siteSettings.cookiePosition || "bottom",
        cookieTheme: siteSettings.cookieTheme || "light",
        
        // Privacy Policy Settings
        privacyPolicyTitle: siteSettings.privacyPolicyTitle || "",
        privacyPolicyTitleUk: siteSettings.privacyPolicyTitleUk || "",
        privacyPolicyTitleRu: siteSettings.privacyPolicyTitleRu || "",
        privacyPolicyTitleEn: siteSettings.privacyPolicyTitleEn || "",
        privacyPolicyContent: siteSettings.privacyPolicyContent || "",
        privacyPolicyContentUk: siteSettings.privacyPolicyContentUk || "",
        privacyPolicyContentRu: siteSettings.privacyPolicyContentRu || "",
        privacyPolicyContentEn: siteSettings.privacyPolicyContentEn || "",
        privacyPolicyLastUpdated: siteSettings.privacyPolicyLastUpdated || "",
        privacyPolicyLastUpdatedUk: siteSettings.privacyPolicyLastUpdatedUk || "",
        privacyPolicyLastUpdatedRu: siteSettings.privacyPolicyLastUpdatedRu || "",
        privacyPolicyLastUpdatedEn: siteSettings.privacyPolicyLastUpdatedEn || "",
      });
    }
  }, [siteSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full md:max-w-4xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">CMS - Управление контентом</h1>
            {adminData && (
              <p className="text-sm text-gray-600">
                Вошел как: {adminData.username}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {adminData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCredentialsModalOpen(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Учетные данные
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
              <TabsTrigger value="projects" className="text-xs sm:text-sm p-2">Наши работы</TabsTrigger>
              <TabsTrigger value="services" className="text-xs sm:text-sm p-2">Услуги</TabsTrigger>
              <TabsTrigger value="blog" className="text-xs sm:text-sm p-2">Блог</TabsTrigger>
              <TabsTrigger value="feedback" className="text-xs sm:text-sm p-2">Отзывы</TabsTrigger>
              <TabsTrigger value="team" className="text-xs sm:text-sm p-2">Наша команда</TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs sm:text-sm p-2">Политика</TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm p-2">SEO</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm p-2">Настройки сайта</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Управление разделом "Наши работы"</h2>
                <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingProject(null); projectForm.reset(); }} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить проект
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
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
                              <FormLabel>Изображение проекта</FormLabel>
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="https://example.com/image.jpg или загрузите файл ниже" 
                                      className="flex-1"
                                    />
                                  </FormControl>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center transition-colors">
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <div>
                                      <label className="cursor-pointer">
                                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                          Нажмите для загрузки
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (event) => {
                                                if (event.target?.result) {
                                                  field.onChange(event.target.result as string);
                                                }
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="hidden"
                                        />
                                      </label>
                                      <span className="text-sm text-gray-500"> или перетащите файл сюда</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      PNG, JPG, GIF до 10MB
                                    </p>
                                  </div>
                                </div>
                                {field.value && (
                                  <div className="mt-3 relative">
                                    <div className="relative inline-block">
                                      <img 
                                        src={field.value} 
                                        alt="Предпросмотр проекта" 
                                        className="max-w-full h-32 object-cover rounded-lg border shadow-sm"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                        onClick={() => field.onChange("")}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      <Image className="w-3 h-3 inline mr-1" />
                                      Изображение загружено
                                    </p>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={projectForm.control}
                          name="technologies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Технологии</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  value={field.value?.join(", ") || ""} 
                                  onChange={(e) => field.onChange(e.target.value.split(",").map(tech => tech.trim()).filter(Boolean))}
                                  placeholder="React, TypeScript, Node.js" 
                                />
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
                                <Input {...field} value={field.value || ""} placeholder="https://project-url.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={projectForm.control}
                            name="order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Порядок</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="0"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="isVisible"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 pt-8">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Видимый</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* SEO Settings for Projects */}
                        <div className="border-t pt-6 mt-6" data-project-seo-section>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Search className="w-5 h-5 mr-2" />
                            SEO настройки проекта
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={projectForm.control}
                                name="metaTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Meta Title</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="SEO заголовок страницы проекта" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={projectForm.control}
                                name="canonical"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Canonical URL</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="https://example.com/project" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={projectForm.control}
                              name="metaDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="Краткое описание проекта для поисковых систем" 
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="metaKeywords"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ключевые слова</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      value={field.value?.join(", ") || ""} 
                                      onChange={(e) => field.onChange(e.target.value.split(",").map(keyword => keyword.trim()).filter(Boolean))}
                                      placeholder="веб-разработка, проект, технологии" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={projectForm.control}
                                name="ogTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>OG Title</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="Заголовок для соцсетей" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={projectForm.control}
                                name="ogImage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>OG изображение</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <Input 
                                          {...field} 
                                          value={field.value || ""} 
                                          placeholder="URL изображения для соцсетей" 
                                        />
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                try {
                                                  const formData = new FormData();
                                                  formData.append('file', file);
                                                  
                                                  const response = await fetch('/api/upload/general', {
                                                    method: 'POST',
                                                    body: formData,
                                                  });
                                                  
                                                  if (response.ok) {
                                                    const data = await response.json();
                                                    field.onChange(data.url);
                                                    addNotification({
                                                      type: 'success',
                                                      title: 'Успех',
                                                      message: 'Изображение загружено успешно'
                                                    });
                                                  } else {
                                                    addNotification({
                                                      type: 'error',
                                                      title: 'Ошибка',
                                                      message: 'Ошибка загрузки изображения'
                                                    });
                                                  }
                                                } catch (error) {
                                                  addNotification({
                                                    type: 'error',
                                                    title: 'Ошибка',
                                                    message: 'Ошибка загрузки изображения'
                                                  });
                                                }
                                              }
                                            }}
                                            className="hidden"
                                            id="projectOgImageUpload"
                                          />
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('projectOgImageUpload')?.click()}
                                            className="text-xs h-8"
                                          >
                                            <Upload className="w-3 h-3 mr-1" />
                                            Загрузить
                                          </Button>
                                          {field.value && (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => field.onChange("")}
                                              className="text-xs h-8"
                                            >
                                              <X className="w-3 h-3 mr-1" />
                                              Удалить
                                            </Button>
                                          )}
                                        </div>
                                        {field.value && (
                                          <div className="mt-2">
                                            <img 
                                              src={field.value} 
                                              alt="OG preview" 
                                              className="max-w-xs max-h-24 object-cover rounded border"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                              <Image className="w-3 h-3 inline mr-1" />
                                              Изображение загружено
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={projectForm.control}
                              name="ogDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>OG Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="Описание проекта для соцсетей" 
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="customHeadTags"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Пользовательские мета-теги и скрипты</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="<meta name='robots' content='index,follow'>&#10;<script type='application/ld+json'>...</script>&#10;<link rel='preload' href='...'>" 
                                      rows={8}
                                      className="font-mono text-sm"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Добавьте любые пользовательские мета-теги, скрипты или ссылки, которые должны быть включены в &lt;head&gt; страницы проекта
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsProjectDialogOpen(false)}
                          >
                            Отмена
                          </Button>
                          <Button type="submit" disabled={createProjectMutation.isPending || updateProjectMutation.isPending}>
                            <Save className="w-4 h-4 mr-2" />
                            {editingProject ? "Сохранить" : "Создать"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {projectsLoading ? (
                  <div className="text-center py-8">Загрузка проектов...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Проектов пока нет</div>
                ) : (
                  projects
                    .sort((a, b) => a.order - b.order)
                    .map((project: Project) => (
                    <Card key={project.id} className="p-4 sm:p-6">
                      <CardHeader className="pb-3 px-0 pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <CardTitle className="text-base sm:text-lg">{project.title}</CardTitle>
                                <Badge variant={project.isVisible ? "default" : "secondary"} className="text-xs w-fit">
                                  {project.isVisible ? "Видимый" : "Скрытый"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleProjectVisibility(project)}
                                className="h-9 px-3 text-xs"
                              >
                                {project.isVisible ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                                {project.isVisible ? "Скрыть" : "Показать"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditProject(project)} className="h-9 px-3 text-xs">
                                <Edit className="w-3 h-3 mr-1" />
                                Редактировать
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleEditProject(project);
                                  setTimeout(() => {
                                    const seoSection = document.querySelector('[data-project-seo-section]');
                                    if (seoSection) {
                                      seoSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }, 100);
                                }}
                                className="h-9 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              >
                                <Search className="w-3 h-3 mr-1" />
                                SEO
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteProjectMutation.mutate(project.id)}
                                className="h-9 px-3 text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                          
                          <div className="flex gap-2 flex-wrap">
                            {project.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs py-1">{tech}</Badge>
                            ))}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>Порядок: {project.order}</span>
                            {project.projectUrl && (
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                Открыть проект
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Управление услугами</h2>
                <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingService(null); serviceForm.reset(); }} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить услугу
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
                    <DialogHeader>
                      <DialogTitle>
                        {editingService ? "Редактировать услугу" : "Новая услуга"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <Form {...serviceForm}>
                      <form onSubmit={serviceForm.handleSubmit((data) => {
                        if (editingService) {
                          updateServiceMutation.mutate({ id: editingService.id, data });
                        } else {
                          createServiceMutation.mutate(data);
                        }
                      })} className="space-y-4">
                        <FormField
                          control={serviceForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Название услуги" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={serviceForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Описание услуги" rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={serviceForm.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Иконка (Lucide)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Monitor" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={serviceForm.control}
                            name="order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Порядок</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="0"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={serviceForm.control}
                            name="isVisible"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 pt-8">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Видимая</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* SEO Settings */}
                        <div className="border-t pt-6 mt-6" data-seo-section>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Search className="w-5 h-5 mr-2" />
                            SEO настройки
                          </h3>
                          
                          <div className="space-y-4">
                            <FormField
                              control={serviceForm.control}
                              name="metaTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta заголовок</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="SEO заголовок страницы услуги" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="metaDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Meta описание</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="Краткое описание услуги для поисковых систем" 
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="metaKeywords"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ключевые слова</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      value={field.value?.join(", ") || ""} 
                                      onChange={(e) => field.onChange(e.target.value.split(",").map(keyword => keyword.trim()).filter(Boolean))}
                                      placeholder="веб-разработка, создание сайтов, дизайн" 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={serviceForm.control}
                                name="ogTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>OG заголовок</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="Заголовок для соцсетей" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={serviceForm.control}
                                name="canonical"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Canonical URL</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="https://example.com/service" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={serviceForm.control}
                              name="ogDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>OG описание</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="Описание для социальных сетей" 
                                      rows={2}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="ogImage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>OG изображение</FormLabel>
                                  <FormControl>
                                    <div className="space-y-2">
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="URL изображения для соцсетей" 
                                      />
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              try {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                
                                                const response = await fetch('/api/upload/general', {
                                                  method: 'POST',
                                                  body: formData,
                                                });
                                                
                                                if (response.ok) {
                                                  const data = await response.json();
                                                  field.onChange(data.url);
                                                  addNotification({
                                                    type: 'success',
                                                    title: 'Успех',
                                                    message: 'Изображение загружено успешно'
                                                  });
                                                } else {
                                                  addNotification({
                                                    type: 'error',
                                                    title: 'Ошибка',
                                                    message: 'Ошибка загрузки изображения'
                                                  });
                                                }
                                              } catch (error) {
                                                addNotification({
                                                  type: 'error',
                                                  title: 'Ошибка',
                                                  message: 'Ошибка загрузки изображения'
                                                });
                                              }
                                            }
                                          }}
                                          className="hidden"
                                          id="ogImageUpload"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => document.getElementById('ogImageUpload')?.click()}
                                          className="text-xs h-8"
                                        >
                                          <Upload className="w-3 h-3 mr-1" />
                                          Загрузить
                                        </Button>
                                        {field.value && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => field.onChange("")}
                                            className="text-xs h-8"
                                          >
                                            <X className="w-3 h-3 mr-1" />
                                            Удалить
                                          </Button>
                                        )}
                                      </div>
                                      {field.value && (
                                        <div className="mt-2">
                                          <img 
                                            src={field.value} 
                                            alt="OG preview" 
                                            className="max-w-xs max-h-24 object-cover rounded border"
                                          />
                                          <p className="text-xs text-gray-500 mt-1">
                                            <Image className="w-3 h-3 inline mr-1" />
                                            Изображение загружено
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={serviceForm.control}
                              name="customHeadTags"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Пользовательские мета-теги и скрипты</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""} 
                                      placeholder="<meta name='robots' content='index,follow'>&#10;<script type='application/ld+json'>...</script>&#10;<link rel='preload' href='...'>" 
                                      rows={8}
                                      className="font-mono text-sm"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Добавьте любые пользовательские мета-теги, скрипты или ссылки, которые должны быть включены в &lt;head&gt; страницы услуги
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsServiceDialogOpen(false)}
                          >
                            Отмена
                          </Button>
                          <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                            <Save className="w-4 h-4 mr-2" />
                            {editingService ? "Сохранить" : "Создать"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {servicesLoading ? (
                  <div className="text-center py-8">Загрузка услуг...</div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Услуг пока нет</div>
                ) : (
                  services.map((service: Service) => (
                    <Card key={service.id} className="p-4 sm:p-6">
                      <CardHeader className="pb-3 px-0 pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <CardTitle className="text-base sm:text-lg">{service.title}</CardTitle>
                                <Badge variant={service.isVisible ? "default" : "secondary"} className="text-xs w-fit">
                                  {service.isVisible ? "Видимая" : "Скрытая"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleServiceVisibility(service)}
                                className="h-9 px-3 text-xs"
                              >
                                {service.isVisible ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                                {service.isVisible ? "Скрыть" : "Показать"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditService(service)} className="h-9 px-3 text-xs">
                                <Edit className="w-3 h-3 mr-1" />
                                Редактировать
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingService(service);
                                  serviceForm.reset({
                                    ...service,
                                    features: service.features || []
                                  });
                                  setIsServiceDialogOpen(true);
                                  // Автоматически прокрутить к SEO секции через небольшую задержку
                                  setTimeout(() => {
                                    const seoSection = document.querySelector('[data-seo-section]');
                                    if (seoSection) {
                                      seoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }, 300);
                                }}
                                className="h-9 px-3 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                              >
                                <Search className="w-3 h-3 mr-1" />
                                SEO
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteServiceMutation.mutate(service.id)}
                                className="h-9 px-3 text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{service.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          {service.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs py-1">{feature}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Управление блогом</h2>
                <Dialog open={isBlogPostDialogOpen} onOpenChange={setIsBlogPostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingBlogPost(null); blogPostForm.reset(); }} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить статью
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-2">
                    <DialogHeader>
                      <DialogTitle>
                        {editingBlogPost ? "Редактировать статью" : "Новая статья"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...blogPostForm}>
                      <form onSubmit={blogPostForm.handleSubmit((data) => {
                        if (editingBlogPost) {
                          updateBlogPostMutation.mutate({ id: editingBlogPost.id, data });
                        } else {
                          createBlogPostMutation.mutate(data);
                        }
                      })}>
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={blogPostForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Заголовок</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Введите заголовок статьи" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={blogPostForm.control}
                              name="slug"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL (slug)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="url-friendly-название" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={blogPostForm.control}
                            name="excerpt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Краткое описание</FormLabel>
                                <FormControl>
                                  <div className="border rounded-md">
                                    <ReactQuill
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Краткое описание статьи"
                                      modules={{
                                        toolbar: [
                                          ['bold', 'italic', 'underline'],
                                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                          ['link'],
                                          ['clean']
                                        ],
                                      }}
                                      style={{ 
                                        backgroundColor: 'white',
                                        minHeight: '120px',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word'
                                      }}
                                      className="[&_.ql-editor]:break-words [&_.ql-editor]:whitespace-pre-wrap [&_.ql-editor]:max-w-full [&_.ql-editor]:overflow-wrap-break-word"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={blogPostForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Содержание</FormLabel>
                                <FormControl>
                                  <div className="border rounded-md">
                                    <ReactQuill
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Полное содержание статьи"
                                      modules={{
                                        toolbar: [
                                          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                          ['bold', 'italic', 'underline', 'strike'],
                                          [{ 'color': [] }, { 'background': [] }],
                                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                          [{ 'indent': '-1'}, { 'indent': '+1' }],
                                          [{ 'align': [] }],
                                          ['link', 'image', 'video'],
                                          ['blockquote', 'code-block'],
                                          ['clean']
                                        ],
                                      }}
                                      formats={[
                                        'header', 'font', 'size',
                                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                                        'list', 'bullet', 'indent',
                                        'link', 'image', 'video',
                                        'color', 'background', 'align'
                                      ]}
                                      style={{ 
                                        backgroundColor: 'white',
                                        minHeight: '300px',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word'
                                      }}
                                      className="[&_.ql-editor]:break-words [&_.ql-editor]:whitespace-pre-wrap [&_.ql-editor]:max-w-full [&_.ql-editor]:overflow-wrap-break-word"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={blogPostForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Изображение статьи</FormLabel>
                                <div className="space-y-4">
                                  <div className="flex gap-4">
                                    <FormControl>
                                      <Input 
                                        placeholder="https://example.com/image.jpg" 
                                        {...field} 
                                        value={field.value ?? ''} 
                                      />
                                    </FormControl>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        disabled={uploadingBlogImage}
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) handleBlogImageUpload(file);
                                          };
                                          input.click();
                                        }}
                                      >
                                        {uploadingBlogImage ? (
                                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                        ) : (
                                          <Upload className="w-4 h-4" />
                                        )}
                                        {uploadingBlogImage ? "Загрузка..." : "Загрузить"}
                                      </Button>
                                    </div>
                                  </div>
                                  {field.value && (
                                    <div className="mt-2">
                                      <img 
                                        src={field.value} 
                                        alt="Превью изображения" 
                                        className="w-full max-w-xs h-auto rounded-lg border"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={blogPostForm.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Теги (через запятую)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="веб-разработка, дизайн, технологии" 
                                    value={field.value?.join(", ") || ""}
                                    onChange={(e) => field.onChange(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={blogPostForm.control}
                            name="isPublished"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Опубликовать статью</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Статья будет видна на сайте
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

                          {/* SEO настройки */}
                          <div className="space-y-4 border-t pt-6">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                              <Search className="w-5 h-5" />
                              SEO настройки
                            </h4>
                            
                            {/* Основные meta теги */}
                            <div className="space-y-4">
                              <h5 className="font-medium">Основные meta теги</h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={blogPostForm.control}
                                  name="metaTitle"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Meta заголовок</FormLabel>
                                      <FormControl>
                                        <Input {...field} value={field.value || ""} placeholder="SEO заголовок статьи" />
                                      </FormControl>
                                      <FormDescription>
                                        Рекомендуется 50-60 символов
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={blogPostForm.control}
                                  name="canonical"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Canonical URL</FormLabel>
                                      <FormControl>
                                        <Input {...field} value={field.value || ""} placeholder="https://example.com/blog/article" />
                                      </FormControl>
                                      <FormDescription>
                                        Канонический URL страницы
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={blogPostForm.control}
                                name="metaDescription"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Meta описание</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} value={field.value || ""} placeholder="Краткое описание статьи для поисковых систем" />
                                    </FormControl>
                                    <FormDescription>
                                      Рекомендуется 150-160 символов
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={blogPostForm.control}
                                name="metaKeywords"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ключевые слова</FormLabel>
                                    <FormControl>
                                      <Input 
                                        value={field.value?.join(", ") || ""} 
                                        onChange={(e) => field.onChange(e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                                        placeholder="веб-разработка, статьи, технологии"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Разделите ключевые слова запятыми
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Open Graph теги */}
                            <div className="space-y-4">
                              <h5 className="font-medium">Open Graph (социальные сети)</h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={blogPostForm.control}
                                  name="ogTitle"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>OG заголовок</FormLabel>
                                      <FormControl>
                                        <Input {...field} value={field.value || ""} placeholder="Заголовок для социальных сетей" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={blogPostForm.control}
                                  name="twitterSite"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Twitter Site</FormLabel>
                                      <FormControl>
                                        <Input {...field} value={field.value || ""} placeholder="@site_handle" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={blogPostForm.control}
                                name="ogDescription"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>OG описание</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} value={field.value || ""} placeholder="Описание для социальных сетей" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={blogPostForm.control}
                                name="ogImage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>OG изображение</FormLabel>
                                    <div className="space-y-3">
                                      {field.value && (
                                        <div className="relative">
                                          <img
                                            src={field.value}
                                            alt="OG изображение"
                                            className="w-full max-w-md h-auto rounded-lg border"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => field.onChange("")}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                      
                                      <div className="flex gap-2">
                                        <FormControl>
                                          <Input
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="URL изображения"
                                          />
                                        </FormControl>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = (e) => {
                                              const file = (e.target as HTMLInputElement).files?.[0];
                                              if (file) {
                                                // Использую ту же функцию загрузки что и для обычного изображения
                                                handleBlogImageUpload(file).then(() => {
                                                  // После загрузки устанавливаю URL в поле OG изображения
                                                  const imageUrl = blogPostForm.getValues('imageUrl');
                                                  if (imageUrl) {
                                                    field.onChange(imageUrl);
                                                  }
                                                });
                                              }
                                            };
                                            input.click();
                                          }}
                                        >
                                          <Upload className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Дополнительные настройки */}
                            <div className="space-y-4">
                              <h5 className="font-medium">Дополнительные настройки</h5>
                              
                              <FormField
                                control={blogPostForm.control}
                                name="structuredData"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Структурированные данные (JSON-LD)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
                                        rows={4}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      JSON-LD схема для поисковых систем
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={blogPostForm.control}
                                name="customHeadTags"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Дополнительные теги</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="<meta name='custom' content='value' />"
                                        rows={3}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Дополнительные HTML теги для head секции
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsBlogPostDialogOpen(false)}
                            >
                              Отмена
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={createBlogPostMutation.isPending || updateBlogPostMutation.isPending}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {editingBlogPost ? "Сохранить" : "Создать"}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {blogPostsLoading ? (
                  <div>Загрузка...</div>
                ) : (
                  blogPosts.map((blogPost: BlogPost) => (
                    <Card key={blogPost.id} className="hover:shadow-md transition-shadow p-4 sm:p-6">
                      <CardHeader className="pb-3 px-0 pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex-1">
                                <CardTitle className="text-base sm:text-lg mb-2">{blogPost.title}</CardTitle>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant={blogPost.isPublished ? "default" : "secondary"} className="text-xs w-fit">
                                    {blogPost.isPublished ? "Опубликована" : "Черновик"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{blogPost.slug}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleBlogPostPublication(blogPost)}
                                className="h-9 px-3 text-xs"
                              >
                                {blogPost.isPublished ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                                {blogPost.isPublished ? "Скрыть" : "Опубликовать"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditBlogPost(blogPost)} className="h-9 px-3 text-xs">
                                <Edit className="w-3 h-3 mr-1" />
                                Редактировать
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setActiveSeoSection('blog');
                                  setActiveSeoItemId(blogPost.id);
                                  setActiveTab('seo');
                                  setTimeout(() => {
                                    const seoSection = document.querySelector(`[data-seo-section="blog"]`);
                                    if (seoSection) {
                                      seoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                  }, 100);
                                }}
                                className="h-9 px-3 text-xs"
                              >
                                <Search className="w-3 h-3 mr-1" />
                                SEO
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteBlogPostMutation.mutate(blogPost.id)}
                                className="h-9 px-3 text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{stripHtmlTags(blogPost.excerpt)}</p>
                        {blogPost.tags && blogPost.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-3">
                            {blogPost.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs py-1">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Создана: {new Date(blogPost.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Widget Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Отзывы с виджета обратной связи</h2>
                <Badge variant="secondary" className="text-sm">
                  {widgetFeedback.length} сообщений
                </Badge>
              </div>
              
              <div className="space-y-4">
                {widgetFeedbackLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : widgetFeedback.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">Пока нет отзывов</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Отзывы, отправленные через виджет на сайте, будут отображаться здесь
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  widgetFeedback.map((feedback: any) => (
                    <Card key={feedback.id} className="p-4 sm:p-6">
                      <CardHeader className="pb-3 px-0 pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-2 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <CardTitle className="text-base sm:text-lg">{feedback.name}</CardTitle>
                                  <div className="flex gap-1 flex-wrap">
                                    {feedback.message.includes('💬') && <Badge className="bg-primary text-xs">Общий отзыв</Badge>}
                                    {feedback.message.includes('🐛') && <Badge className="bg-coral text-xs">Ошибка</Badge>}
                                    {feedback.message.includes('💡') && <Badge className="bg-purple text-xs">Предложение</Badge>}
                                    {feedback.message.includes('❤️') && <Badge className="bg-orange text-xs">Похвала</Badge>}
                                    {feedback.message.includes('звезд') && <Badge variant="outline" className="text-xs">С оценкой</Badge>}
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {new Date(feedback.createdAt).toLocaleString('ru-RU')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markFeedbackAsReadMutation.mutate(feedback.id)}
                                disabled={markFeedbackAsReadMutation.isPending}
                                className="h-9 px-3 text-xs w-full sm:w-auto"
                              >
                                {markFeedbackAsReadMutation.isPending ? (
                                  <>
                                    <div className="animate-spin w-3 h-3 border border-gray-300 border-t-transparent rounded-full mr-2" />
                                    Отмечаем...
                                  </>
                                ) : (
                                  "Отметить как прочитанное"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pb-0">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Сообщение:</h4>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg">
                              {feedback.message.replace('[WIDGET]', '').trim()}
                            </p>
                          </div>
                          {feedback.phone && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Контакт:</h4>
                              <p className="text-sm font-medium">{feedback.phone}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* About Section Management Tab */}
            <TabsContent value="team" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Наша команда</h2>
              </div>
              
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit((data) => updateSiteSettingsMutation.mutate(data))} className="space-y-6">
                  
                  {/* About Section Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Содержимое раздела "О нас"</CardTitle>
                      <CardDescription>
                        Редактируйте заголовок и описание в блоке "О нас" на главной странице
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="aboutTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Заголовок раздела</FormLabel>
                            <FormControl>
                              <Input placeholder="Про нас" {...field} />
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
                              <Textarea 
                                placeholder="Опишите вашу команду и подход к работе..." 
                                rows={4}
                                {...field} 
                              />
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
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="https://example.com/team-photo.jpg" 
                                    {...field} 
                                    value={field.value || ""} 
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={uploadingTeamImage}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) handleTeamImageUpload(file, field);
                                    };
                                    input.click();
                                  }}
                                >
                                  {uploadingTeamImage ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              {field.value && (
                                <div className="mt-2">
                                  <img 
                                    src={field.value} 
                                    alt="Предпросмотр изображения команды" 
                                    className="w-full max-w-md h-32 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                            </div>
                            <FormDescription>
                              URL изображения команды, которое будет отображаться в блоке "О нас"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Features Cards */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Карточки особенностей</CardTitle>
                      <CardDescription>
                        Редактируйте три карточки с особенностями команды
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Feature 1 */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium text-orange-600">Карточка 1</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="feature1Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input placeholder="Інноваційний підхід" {...field} />
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
                                <FormControl>
                                  <Input placeholder="rocket" {...field} />
                                </FormControl>
                                <FormDescription>rocket, users, award, etc.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="feature1Description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Feature 2 */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium text-purple-600">Карточка 2</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="feature2Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input placeholder="Командна робота" {...field} />
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
                                <FormControl>
                                  <Input placeholder="users" {...field} />
                                </FormControl>
                                <FormDescription>rocket, users, award, etc.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="feature2Description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Feature 3 */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium text-red-600">Карточка 3</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="feature3Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input placeholder="Якість" {...field} />
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
                                <FormControl>
                                  <Input placeholder="award" {...field} />
                                </FormControl>
                                <FormDescription>rocket, users, award, etc.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="feature3Description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateSiteSettingsMutation.isPending || settingsLoading}
                  >
                    {updateSiteSettingsMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить настройки раздела "О нас"
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Privacy Policy Tab */}
            <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Политика конфиденциальности</h2>
              </div>

              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit((data) => updateSiteSettingsMutation.mutate(data))} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Настройки политики конфиденциальности</CardTitle>
                        <CardDescription>
                          Управление содержимым страницы политики конфиденциальности для всех языков
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Заголовок политики */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Заголовок страницы</h4>
                          <FormField
                            control={settingsForm.control}
                            name="privacyPolicyTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Політика конфіденційності" />
                                </FormControl>
                                <FormDescription>
                                  Заголовок будет автоматически переведен на все языки сайта
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Содержимое политики */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Содержимое политики</h4>
                          
                          {/* Кнопки быстрой вставки */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentContent = settingsForm.getValues("privacyPolicyContent") || "";
                                const newContent = currentContent + "\n<h2>Новый раздел</h2>\n<p>Содержимое раздела...</p>\n";
                                settingsForm.setValue("privacyPolicyContent", newContent, { shouldValidate: true });
                                settingsForm.trigger("privacyPolicyContent");
                              }}
                              className="text-xs"
                            >
                              + Раздел
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentContent = settingsForm.getValues("privacyPolicyContent") || "";
                                const newContent = currentContent + "\n<ul>\n<li>Пункт списка 1</li>\n<li>Пункт списка 2</li>\n<li>Пункт списка 3</li>\n</ul>\n";
                                settingsForm.setValue("privacyPolicyContent", newContent, { shouldValidate: true });
                                settingsForm.trigger("privacyPolicyContent");
                              }}
                              className="text-xs"
                            >
                              + Список
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentContent = settingsForm.getValues("privacyPolicyContent") || "";
                                const newContent = currentContent + "\n<p><strong>Важно:</strong> Выделенный текст с пояснением...</p>\n";
                                settingsForm.setValue("privacyPolicyContent", newContent, { shouldValidate: true });
                                settingsForm.trigger("privacyPolicyContent");
                              }}
                              className="text-xs"
                            >
                              + Важно
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const templateContent = `<h2>1. ОБЩИЕ ПОЛОЖЕНИЯ</h2>
<p>Эта Политика конфиденциальности описывает, как компания Webservice Studio собирает, использует, хранит и защищает персональные данные посетителей нашего веб-сайта и клиентов при использовании наших услуг веб-разработки.</p>

<h2>2. СБОР ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
<p>Мы можем собирать следующие типы персональных данных:</p>
<ul>
<li>Контактная информация: имя, фамилия, адрес электронной почты, номер телефона</li>
<li>Информация о компании: название организации, должность, сфера деятельности</li>
<li>Техническая информация: IP-адрес, тип браузера, операционная система</li>
<li>Данные об использовании сайта: страницы, которые вы посещаете, время пребывания на сайте</li>
</ul>

<h2>3. ЦЕЛЬ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
<p>Мы используем ваши персональные данные для:</p>
<ul>
<li>Предоставления консультаций и разработки веб-решений</li>
<li>Общения с клиентами и потенциальными клиентами</li>
<li>Улучшения качества наших услуг</li>
<li>Маркетинговых целей (с вашего согласия)</li>
<li>Выполнения договорных обязательств</li>
</ul>

<h2>4. ЗАЩИТА ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
<p>Мы внедряем технические и организационные меры для защиты ваших персональных данных:</p>
<ul>
<li>Шифрование данных при передаче (SSL/TLS)</li>
<li>Ограниченный доступ к персональным данным</li>
<li>Регулярное обновление систем безопасности</li>
<li>Обучение персонала вопросам конфиденциальности</li>
</ul>

<h2>5. ВАШИ ПРАВА</h2>
<p>Согласно законодательству о защите персональных данных, вы имеете право:</p>
<ul>
<li>Получать информацию об обработке ваших персональных данных</li>
<li>Требовать внесения изменений или удаления персональных данных</li>
<li>Отзывать согласие на обработку данных</li>
<li>Подавать жалобы в соответствующие органы</li>
</ul>

<h2>6. КОНТАКТНАЯ ИНФОРМАЦИЯ</h2>
<p>Если у вас есть вопросы относительно обработки персональных данных или вы хотите воспользоваться своими правами, свяжитесь с нами через контактную информацию, указанную в разделе контактов нашего сайта.</p>`;
                                settingsForm.setValue("privacyPolicyContent", templateContent, { shouldValidate: true });
                                settingsForm.trigger("privacyPolicyContent");
                                // Принудительное обновление ReactQuill
                                setTimeout(() => {
                                  settingsForm.setValue("privacyPolicyContent", templateContent, { shouldValidate: true });
                                }, 100);
                              }}
                              className="text-xs col-span-2 md:col-span-4"
                            >
                              Загрузить готовый шаблон
                            </Button>
                          </div>

                          <FormField
                            control={settingsForm.control}
                            name="privacyPolicyContent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Содержимое</FormLabel>
                                <FormControl>
                                  <ReactQuill
                                    theme="snow"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    className="bg-white"
                                    placeholder="Введите содержимое политики конфиденциальности..."
                                    modules={{
                                      toolbar: [
                                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                        [{ 'font': [] }],
                                        [{ 'size': ['small', false, 'large', 'huge'] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'color': [] }, { 'background': [] }],
                                        [{ 'script': 'sub'}, { 'script': 'super' }],
                                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                                        [{ 'direction': 'rtl' }],
                                        [{ 'align': [] }],
                                        ['link', 'image', 'video'],
                                        ['blockquote', 'code-block'],
                                        ['clean']
                                      ],
                                    }}
                                    style={{ minHeight: '300px' }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Используйте панель инструментов для форматирования текста. Содержимое будет автоматически переведено на все языки сайта при отображении.
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Дата последнего обновления */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Дата последнего обновления</h4>
                          <FormField
                            control={settingsForm.control}
                            name="privacyPolicyLastUpdated"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Дата обновления</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="грудень 2024" />
                                </FormControl>
                                <FormDescription>
                                  Дата будет автоматически переведена на все языки сайта
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Button type="submit" disabled={updateSiteSettingsMutation.isPending} className="w-full">
                      {updateSiteSettingsMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить политику конфиденциальности
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Настройки SEO</h2>
              </div>

              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit((data) => updateSiteSettingsMutation.mutate(data))} className="space-y-6">
                    {/* Основные SEO настройки */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Search className="w-5 h-5" />
                          Основные SEO настройки
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="siteTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок сайта</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Webservice Studio" />
                                </FormControl>
                                <FormDescription>
                                  Основной заголовок сайта для поисковых систем
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="siteDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Описание сайта</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Профессиональная веб-разработка..." />
                                </FormControl>
                                <FormDescription>
                                  Краткое описание сайта для поисковых систем (рекомендуется 150-160 символов)
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="siteKeywords"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ключевые слова</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="веб-разработка, сайты, приложения..." />
                                </FormControl>
                                <FormDescription>
                                  Ключевые слова через запятую
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={settingsForm.control}
                              name="siteAuthor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Автор сайта</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Webservice Studio" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={settingsForm.control}
                              name="siteUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL сайта</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="https://web-service.studio" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Open Graph настройки */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Share2 className="w-5 h-5" />
                          Open Graph (социальные сети)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="ogTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>OG заголовок</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="Оставьте пустым для использования заголовка сайта" />
                                </FormControl>
                                <FormDescription>
                                  Заголовок для социальных сетей (Facebook, LinkedIn)
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="ogDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>OG описание</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Оставьте пустым для использования описания сайта" />
                                </FormControl>
                                <FormDescription>
                                  Описание для социальных сетей
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="ogImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>OG изображение</FormLabel>
                                <div className="space-y-4">
                                  <div className="flex gap-4">
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        value={field.value || ""} 
                                        placeholder="https://example.com/image.jpg" 
                                      />
                                    </FormControl>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const fileInput = document.createElement('input');
                                          fileInput.type = 'file';
                                          fileInput.accept = 'image/*';
                                          fileInput.onchange = async (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                              const formData = new FormData();
                                              formData.append('image', file);
                                              
                                              try {
                                                const response = await fetch('/api/admin/upload/seo-image', {
                                                  method: 'POST',
                                                  body: formData,
                                                });
                                                
                                                if (response.ok) {
                                                  const data = await response.json();
                                                  field.onChange(data.imageUrl);
                                                  addNotification({
                                                    title: 'Успех',
                                                    message: 'Изображение загружено успешно'
                                                  });
                                                } else {
                                                  addNotification({
                                                    title: 'Ошибка',
                                                    message: 'Не удалось загрузить изображение'
                                                  });
                                                }
                                              } catch (error) {
                                                console.error('Upload error:', error);
                                                addNotification({
                                                  title: 'Ошибка',
                                                  message: 'Произошла ошибка при загрузке'
                                                });
                                              }
                                            }
                                          };
                                          fileInput.click();
                                        }}
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Загрузить
                                      </Button>
                                      {field.value && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(field.value, '_blank')}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  {field.value && (
                                    <div className="mt-4">
                                      <img 
                                        src={field.value} 
                                        alt="OG изображение" 
                                        className="max-w-xs max-h-32 object-cover rounded border"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <FormDescription>
                                  Изображение для превью в социальных сетях (рекомендуется 1200x630px)
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Дополнительные настройки */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Дополнительные настройки
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="canonical"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Canonical URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com/page" />
                                </FormControl>
                                <FormDescription>
                                  Канонический URL страницы
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="twitterSite"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter аккаунт сайта</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="@webservice_studio" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="twitterCreator"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter автор</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="@author_name" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Robots.txt настройки */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Настройки Robots.txt
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Управление содержимым файла robots.txt для поисковых роботов
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={settingsForm.control}
                          name="robotsTxtContent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Содержимое robots.txt</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  value={field.value || ""} 
                                  placeholder={`User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /paypal/

# Crawl delay (optional)
Crawl-delay: 1`}
                                  rows={10}
                                  className="font-mono text-sm"
                                />
                              </FormControl>
                              <FormDescription>
                                Примечание: Ссылка на sitemap.xml и разрешения для важных страниц добавляются автоматически
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const defaultRobots = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /paypal/

# Crawl delay (optional)
Crawl-delay: 1`;
                              settingsForm.setValue('robotsTxtContent', defaultRobots);
                            }}
                          >
                            Загрузить стандартный шаблон
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              window.open('/robots.txt', '_blank');
                            }}
                          >
                            Предпросмотр robots.txt
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Аналитика */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Аналитика и отслеживание
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="googleAnalyticsId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Google Analytics ID</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="GA-XXXXXXXXX-X" />
                                </FormControl>
                                <FormDescription>
                                  Идентификатор Google Analytics
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="googleTagManagerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Google Tag Manager ID</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="GTM-XXXXXXX" />
                                </FormControl>
                                <FormDescription>
                                  Идентификатор Google Tag Manager
                                </FormDescription>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="facebookPixelId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Facebook Pixel ID</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="123456789012345" />
                                </FormControl>
                                <FormDescription>
                                  Идентификатор Facebook Pixel
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Настройки куки */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Настройки куки (GDPR)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={settingsForm.control}
                          name="cookieConsentEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Включить уведомления о куки
                                </FormLabel>
                                <FormDescription>
                                  Показывать баннер согласия на использование куки
                                </FormDescription>
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

                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={settingsForm.control}
                            name="cookieTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Заголовок уведомления</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="Ми використовуємо файли cookie" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={settingsForm.control}
                            name="cookieMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Текст уведомления</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ""} placeholder="Цей сайт використовує файли cookie..." />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={settingsForm.control}
                              name="cookieAcceptText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Текст кнопки "Принять"</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="Прийняти" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={settingsForm.control}
                              name="cookieDeclineText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Текст кнопки "Отклонить"</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="Відхилити" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={settingsForm.control}
                              name="cookieSettingsText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Текст кнопки "Настройки"</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="Налаштування" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={settingsForm.control}
                              name="cookiePolicyUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ссылка на политику куки</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="/privacy-policy" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={settingsForm.control}
                              name="cookiePosition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Позиция баннера</FormLabel>
                                  <FormControl>
                                    <select {...field} value={field.value || "bottom"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                                      <option value="top">Сверху</option>
                                      <option value="bottom">Снизу</option>
                                      <option value="center">По центру</option>
                                    </select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={settingsForm.control}
                              name="cookieTheme"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Тема баннера</FormLabel>
                                  <FormControl>
                                    <select {...field} value={field.value || "light"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                                      <option value="light">Светлая</option>
                                      <option value="dark">Темная</option>
                                      <option value="auto">Авто</option>
                                    </select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Мета-теги и скрипты главной страницы */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          Мета-теги и скрипты главной страницы
                        </CardTitle>
                        <CardDescription>
                          Дополнительные мета-теги и скрипты для head секции главной страницы
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={settingsForm.control}
                          name="homepageMetaTags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Дополнительные мета-теги</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  value={field.value || ""} 
                                  placeholder={`<meta name="keywords" content="веб-разработка, дизайн, SEO">\n<meta name="author" content="Webservice Studio">\n<meta name="robots" content="index, follow">`}
                                  rows={6}
                                  className="font-mono text-sm"
                                />
                              </FormControl>
                              <FormDescription>
                                HTML мета-теги для добавления в &lt;head&gt; главной страницы. Каждый тег с новой строки.
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="homepageHeadScripts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Скрипты для head секции</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  value={field.value || ""} 
                                  placeholder={`<script>\n  // Дополнительный JavaScript код\n  console.log('Homepage loaded');\n</script>\n\n<script src="https://example.com/script.js"></script>`}
                                  rows={8}
                                  className="font-mono text-sm"
                                />
                              </FormControl>
                              <FormDescription>
                                JavaScript код и внешние скрипты для добавления в &lt;head&gt; главной страницы. Включайте полные &lt;script&gt; теги.
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              <strong>Важно:</strong> Эти настройки применяются только к главной странице сайта. 
                              Убедитесь, что весь код корректен и не содержит ошибок, которые могут нарушить работу сайта.
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={updateSiteSettingsMutation.isPending || settingsLoading}
                    >
                      {updateSiteSettingsMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить SEO настройки
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            {/* Site Settings Tab */}
            <TabsContent value="settings" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">Настройки сайта</h2>
              </div>

              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit((data) => updateSiteSettingsMutation.mutate(data))} className="space-y-6">
                  
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Контактная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название компании</FormLabel>
                            <FormControl>
                              <Input placeholder="Webservice Studio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <Input placeholder="+380959212203" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="support@web-service.studio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Адрес</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Україна, 52501, м.Синельникове, вул.Миру 36" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Social Media Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Социальные сети</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="facebookUrl"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>Facebook URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://facebook.com/your-page" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="facebookVisible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Показывать</FormLabel>
                                <FormDescription>
                                  Отображать иконку в футере
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="instagramUrl"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>Instagram URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://instagram.com/your-profile" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="instagramVisible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Показывать</FormLabel>
                                <FormDescription>
                                  Отображать иконку в футере
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="youtubeUrl"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>YouTube URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://youtube.com/@your-channel" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="youtubeVisible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Показывать</FormLabel>
                                <FormDescription>
                                  Отображать иконку в футере
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="telegramUrl"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>Telegram URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://t.me/your-channel" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="telegramVisible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Показывать</FormLabel>
                                <FormDescription>
                                  Отображать иконку в футере
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="githubUrl"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>GitHub URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/your-profile" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="githubVisible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Показывать</FormLabel>
                                <FormDescription>
                                  Отображать иконку в футере
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="linkedinUrl"
                          render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                              <FormLabel>LinkedIn URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/your-profile" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="linkedinVisible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Показывать</FormLabel>
                                <FormDescription>
                                  Отображать иконку в футере
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? true}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Company Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Настройки компании</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название компании</FormLabel>
                            <FormControl>
                              <Input placeholder="Webservice Studio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={settingsForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Логотип</FormLabel>
                            <div className="space-y-4">
                              {/* Current logo preview */}
                              {field.value && (
                                <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                                  <img 
                                    src={field.value} 
                                    alt="Current logo" 
                                    className="w-12 h-12 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Текущий логотип</p>
                                    <p className="text-xs text-gray-500 truncate">{field.value}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange("")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              
                              {/* File upload */}
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="text-center">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <div className="mt-4">
                                    <label className="cursor-pointer">
                                      <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Загрузить новый логотип
                                      </span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            try {
                                              const formData = new FormData();
                                              formData.append('file', file);
                                              
                                              const response = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: formData,
                                              });
                                              
                                              if (response.ok) {
                                                const data = await response.json();
                                                field.onChange(data.url);
                                              } else {
                                                console.error('Upload failed');
                                              }
                                            } catch (error) {
                                              console.error('Upload error:', error);
                                            }
                                          }
                                        }}
                                      />
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                      PNG, JPG, SVG до 5MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Manual URL input */}
                              <div>
                                <FormLabel className="text-sm font-medium">Или введите URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://example.com/logo.png" 
                                    {...field} 
                                    value={field.value || ""} 
                                  />
                                </FormControl>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Описание компании</h3>
                        <FormField
                          control={settingsForm.control}
                          name="footerDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание компании</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Професійна веб-розробка з використанням сучасних технологій" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground">
                                Описание будет автоматически переведено на другие языки при отображении на сайте
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Logo Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Логотип</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL логотипа</FormLabel>
                            <p className="text-xs text-muted-foreground mb-2">
                              Логотип будет отображаться в шапке сайта слева от названия компании
                            </p>
                            <div className="space-y-4">
                              {/* Current logo preview */}
                              {field.value && (
                                <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                                  <img 
                                    src={field.value} 
                                    alt="Current logo" 
                                    className="w-12 h-12 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Текущий логотип</p>
                                    <p className="text-xs text-gray-500 truncate">{field.value}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange("")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/logo.png или загрузите файл ниже" 
                                  {...field} 
                                  value={field.value || ""} 
                                />
                              </FormControl>
                              
                              {/* File Upload Section */}
                              <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center transition-colors">
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-8 h-8 text-gray-400" />
                                  <div>
                                    <label className="cursor-pointer">
                                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                        Загрузить файл логотипа
                                      </span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Проверяем размер файла (макс 5MB)
                                            if (file.size > 5 * 1024 * 1024) {
                                              addNotification({
                                                type: 'error',
                                                priority: 'medium',
                                                title: 'Ошибка загрузки',
                                                message: 'Размер файла не должен превышать 5MB',
                                              });
                                              return;
                                            }
                                            
                                            // Конвертируем в base64
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                              const base64 = event.target?.result as string;
                                              field.onChange(base64);
                                              addNotification({
                                                type: 'success',
                                                priority: 'low',
                                                title: 'Логотип загружен',
                                                message: 'Файл успешно загружен и конвертирован',
                                              });
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      PNG, JPG, SVG до 5MB
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Menu Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Меню разделов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">О нас</h4>
                        <div className="flex items-center space-x-4">
                          <FormField
                            control={settingsForm.control}
                            name="showAboutMenu"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value ?? true}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Показывать в меню</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="aboutMenu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название пункта меню</FormLabel>
                              <FormControl>
                                <Input placeholder="Про нас" {...field} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground">
                                Название будет автоматически переведено на другие языки
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Contact Menu */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Контакты</h4>
                        <div className="flex items-center space-x-4">
                          <FormField
                            control={settingsForm.control}
                            name="showContactMenu"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value ?? true}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Показывать в меню</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="contactMenu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название пункта меню</FormLabel>
                              <FormControl>
                                <Input placeholder="Контакти" {...field} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground">
                                Название будет автоматически переведено на другие языки
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Blog Menu */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Блог</h4>
                        <div className="flex items-center space-x-4">
                          <FormField
                            control={settingsForm.control}
                            name="showBlogMenu"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value ?? true}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Показывать в меню</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="blogMenu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название пункта меню</FormLabel>
                              <FormControl>
                                <Input placeholder="Блог" {...field} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground">
                                Название будет автоматически переведено на другие языки
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Admin Menu */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Админ панель</h4>
                        <div className="flex items-center space-x-4">
                          <FormField
                            control={settingsForm.control}
                            name="showAdminMenu"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value ?? true}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Показывать в меню</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={settingsForm.control}
                          name="adminMenu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название пункта меню</FormLabel>
                              <FormControl>
                                <Input placeholder="Адмін" {...field} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground">
                                Название будет автоматически переведено на другие языки
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>

                    </CardContent>
                  </Card>

                  <MenuManagement settingsForm={settingsForm} />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateSiteSettingsMutation.isPending || settingsLoading}
                  >
                    {updateSiteSettingsMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить настройки
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Admin Credentials Modal */}
      {adminData && (
        <AdminCredentialsModal
          isOpen={isCredentialsModalOpen}
          onClose={() => setIsCredentialsModalOpen(false)}
          adminId={adminData.id}
          currentUsername={adminData.username}
          currentEmail={adminData.email}
        />
      )}
    </div>
  );
}

// Blog Post SEO Form Component
interface BlogPostSeoFormProps {
  blogPost: BlogPost;
  onUpdate: (updatedBlogPost: BlogPost) => void;
}

function BlogPostSeoForm({ blogPost, onUpdate }: BlogPostSeoFormProps) {
  const { addNotification } = useNotifications();
  
  const seoForm = useForm<Partial<BlogPost>>({
    defaultValues: {
      metaTitle: blogPost.metaTitle || "",
      metaDescription: blogPost.metaDescription || "",
      metaKeywords: blogPost.metaKeywords || [],
      ogTitle: blogPost.ogTitle || "",
      ogDescription: blogPost.ogDescription || "",
      ogImage: blogPost.ogImage || "",
      canonical: blogPost.canonical || "",
      structuredData: blogPost.structuredData || "",
      customHeadTags: blogPost.customHeadTags || "",
      twitterSite: blogPost.twitterSite || "",
      twitterCreator: blogPost.twitterCreator || "",
      googleAnalyticsId: blogPost.googleAnalyticsId || "",
      googleTagManagerId: blogPost.googleTagManagerId || "",
      facebookPixelId: blogPost.facebookPixelId || "",
    },
  });

  const updateBlogPostSeoMutation = useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      const response = await apiRequest("PATCH", `/api/admin/blog/${blogPost.id}/seo`, data);
      return response.json();
    },
    onSuccess: (updatedBlogPost: BlogPost) => {
      onUpdate(updatedBlogPost);
      addNotification({
        type: 'success',
        title: 'SEO настройки сохранены',
        message: 'SEO параметры статьи успешно обновлены',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Ошибка сохранения',
        message: 'Не удалось сохранить SEO настройки',
      });
    },
  });

  const handleImageUpload = async (file: File, field: any) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        field.onChange(data.url);
        addNotification({
          type: 'success',
          title: 'Изображение загружено',
          message: 'OG изображение успешно загружено',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка загрузки',
        message: 'Не удалось загрузить изображение',
      });
    }
  };

  return (
    <Form {...seoForm}>
      <div className="space-y-6">
        {/* Основные meta теги */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Основные meta теги</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={seoForm.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta заголовок</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="SEO заголовок статьи" />
                  </FormControl>
                  <FormDescription>
                    Рекомендуется 50-60 символов
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={seoForm.control}
              name="canonical"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="https://example.com/blog/article" />
                  </FormControl>
                  <FormDescription>
                    Канонический URL страницы
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={seoForm.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta описание</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} placeholder="Краткое описание статьи для поисковых систем" />
                </FormControl>
                <FormDescription>
                  Рекомендуется 150-160 символов
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={seoForm.control}
            name="metaKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ключевые слова</FormLabel>
                <FormControl>
                  <Input 
                    value={field.value?.join(", ") || ""} 
                    onChange={(e) => field.onChange(e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                    placeholder="веб-разработка, статьи, технологии"
                  />
                </FormControl>
                <FormDescription>
                  Разделите ключевые слова запятыми
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {/* Open Graph теги */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Open Graph (социальные сети)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={seoForm.control}
              name="ogTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG заголовок</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Заголовок для социальных сетей" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={seoForm.control}
              name="twitterSite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter Site</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="@site_handle" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={seoForm.control}
            name="ogDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OG описание</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} placeholder="Описание для социальных сетей" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={seoForm.control}
            name="ogImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OG изображение</FormLabel>
                <div className="space-y-3">
                  {field.value && (
                    <div className="relative">
                      <img
                        src={field.value}
                        alt="OG изображение"
                        className="w-full max-w-md h-auto rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => field.onChange("")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="URL изображения"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleImageUpload(file, field);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Дополнительные настройки */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Дополнительные настройки</h4>
          
          <FormField
            control={seoForm.control}
            name="structuredData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Структурированные данные (JSON-LD)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    value={field.value || ""} 
                    placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  JSON-LD схема для поисковых систем
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={seoForm.control}
            name="customHeadTags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дополнительные теги</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    value={field.value || ""} 
                    placeholder="<meta name='custom' content='value' />"
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  Дополнительные HTML теги для head секции
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="button"
          onClick={() => updateBlogPostSeoMutation.mutate(seoForm.getValues())}
          className="w-full"
          disabled={updateBlogPostSeoMutation.isPending}
        >
          {updateBlogPostSeoMutation.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить SEO настройки
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}