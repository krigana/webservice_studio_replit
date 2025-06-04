import { 
  users, contacts, projects, services, blogPosts, siteSettings, admins, customMenuItems, teamMembers,
  type User, type InsertUser, 
  type Contact, type InsertContact,
  type Project, type InsertProject,
  type Service, type InsertService,
  type BlogPost, type InsertBlogPost,
  type SiteSettings, type InsertSiteSettings,
  type Admin, type InsertAdmin,
  type CustomMenuItem, type InsertCustomMenuItem,
  type TeamMember, type InsertTeamMember,
  type ChangePassword, type ChangeCredentials
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admins
  getAdminById(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdminLastLogin(id: number): Promise<void>;
  updateAdminCredentials(id: number, username?: string, password?: string): Promise<Admin | undefined>;
  recordFailedLogin(id: number): Promise<void>;
  resetFailedLogins(id: number): Promise<void>;
  isAdminLocked(admin: Admin): boolean;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  markContactAsRead(id: number): Promise<void>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getVisibleProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Services
  getAllServices(): Promise<Service[]>;
  getVisibleServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, blogPost: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  // Custom Menu Items
  getAllCustomMenuItems(): Promise<CustomMenuItem[]>;
  getVisibleCustomMenuItems(): Promise<CustomMenuItem[]>;
  createCustomMenuItem(menuItem: InsertCustomMenuItem): Promise<CustomMenuItem>;
  updateCustomMenuItem(id: number, menuItem: Partial<InsertCustomMenuItem>): Promise<CustomMenuItem | undefined>;
  deleteCustomMenuItem(id: number): Promise<boolean>;

  // Team Members
  getAllTeamMembers(): Promise<TeamMember[]>;
  getVisibleTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Admins
  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(admins)
      .set({ lastLogin: new Date() })
      .where(eq(admins.id, id));
  }

  async updateAdminCredentials(id: number, username?: string, password?: string): Promise<Admin | undefined> {
    const updateData: any = {};
    
    if (username) {
      updateData.username = username;
    }
    
    if (password) {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getAdminById(id);
    }

    const [updatedAdmin] = await db
      .update(admins)
      .set(updateData)
      .where(eq(admins.id, id))
      .returning();
    
    return updatedAdmin;
  }

  async recordFailedLogin(id: number): Promise<void> {
    const admin = await this.getAdminById(id);
    if (!admin) return;

    const failedAttempts = (admin.failedLoginAttempts || 0) + 1;
    const updateData: any = {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: new Date(),
    };

    // Lock account after 5 failed attempts for 15 minutes
    if (failedAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await db
      .update(admins)
      .set(updateData)
      .where(eq(admins.id, id));
  }

  async resetFailedLogins(id: number): Promise<void> {
    await db
      .update(admins)
      .set({
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
      })
      .where(eq(admins.id, id));
  }

  isAdminLocked(admin: Admin): boolean {
    if (!admin.lockedUntil) return false;
    return new Date() < admin.lockedUntil;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({
        ...insertContact,
        subject: insertContact.subject || null
      })
      .returning();
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(contacts.createdAt);
  }

  async markContactAsRead(id: number): Promise<void> {
    await db.update(contacts).set({ isRead: true }).where(eq(contacts.id, id));
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.order);
  }

  async getVisibleProjects(): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.isVisible, true))
      .orderBy(projects.order);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        ...insertProject,
        order: insertProject.order ?? 0,
        isVisible: insertProject.isVisible ?? true,
        projectUrl: insertProject.projectUrl || null
      })
      .returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.order);
  }

  async getVisibleServices(): Promise<Service[]> {
    return await db.select().from(services)
      .where(eq(services.isVisible, true))
      .orderBy(services.order);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values({
        ...insertService,
        order: insertService.order ?? 0,
        isVisible: insertService.isVisible ?? true
      })
      .returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(blogPosts.order, blogPosts.createdAt);
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(blogPosts.order, blogPosts.publishedAt);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const { translateBlogPost } = await import('./translate');
    
    try {
      // Translate the blog post
      const translations = await translateBlogPost(
        insertBlogPost.title,
        insertBlogPost.excerpt,
        insertBlogPost.content,
        'uk' // Assume Ukrainian as source language
      );

      const blogPostWithTranslations = {
        ...insertBlogPost,
        titleUk: translations.uk.title,
        excerptUk: translations.uk.excerpt,
        contentUk: translations.uk.content,
        titleRu: translations.ru.title,
        excerptRu: translations.ru.excerpt,
        contentRu: translations.ru.content,
        titleEn: translations.en.title,
        excerptEn: translations.en.excerpt,
        contentEn: translations.en.content,
      };

      const [post] = await db
        .insert(blogPosts)
        .values(blogPostWithTranslations)
        .returning();
      return post;
    } catch (error) {
      console.error('Translation failed, creating blog post without translations:', error);
      const [post] = await db
        .insert(blogPosts)
        .values(insertBlogPost)
        .returning();
      return post;
    }
  }

  async updateBlogPost(id: number, blogPostData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...blogPostData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Custom Menu Items
  async getAllCustomMenuItems(): Promise<CustomMenuItem[]> {
    return await db.select().from(customMenuItems).orderBy(customMenuItems.order);
  }

  async getVisibleCustomMenuItems(): Promise<CustomMenuItem[]> {
    return await db.select().from(customMenuItems)
      .where(eq(customMenuItems.isVisible, true))
      .orderBy(customMenuItems.order);
  }

  async createCustomMenuItem(insertMenuItem: InsertCustomMenuItem): Promise<CustomMenuItem> {
    const [menuItem] = await db
      .insert(customMenuItems)
      .values({
        ...insertMenuItem,
        order: insertMenuItem.order ?? 0,
        isVisible: insertMenuItem.isVisible ?? true,
        isExternal: insertMenuItem.isExternal ?? false
      })
      .returning();
    return menuItem;
  }

  async updateCustomMenuItem(id: number, menuItemData: Partial<InsertCustomMenuItem>): Promise<CustomMenuItem | undefined> {
    const [menuItem] = await db
      .update(customMenuItems)
      .set({ ...menuItemData, updatedAt: new Date() })
      .where(eq(customMenuItems.id, id))
      .returning();
    return menuItem || undefined;
  }

  async deleteCustomMenuItem(id: number): Promise<boolean> {
    const result = await db.delete(customMenuItems).where(eq(customMenuItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Team Members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).orderBy(teamMembers.order, teamMembers.id);
  }

  async getVisibleTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.isVisible, true))
      .orderBy(teamMembers.order, teamMembers.id);
  }

  async createTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db
      .insert(teamMembers)
      .values(insertTeamMember)
      .returning();
    return teamMember;
  }

  async updateTeamMember(id: number, teamMemberData: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [teamMember] = await db
      .update(teamMembers)
      .set({ ...teamMemberData, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return teamMember || undefined;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(siteSettings)
        .values({})
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateSiteSettings(settingsData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const currentSettings = await this.getSiteSettings();
    
    const [updatedSettings] = await db
      .update(siteSettings)
      .set(settingsData)
      .where(eq(siteSettings.id, currentSettings.id))
      .returning();
    
    return updatedSettings;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private projects: Map<number, Project>;
  private services: Map<number, Service>;
  private blogPosts: Map<number, BlogPost>;
  private currentUserId: number;
  private currentContactId: number;
  private currentProjectId: number;
  private currentServiceId: number;
  private currentBlogPostId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.projects = new Map();
    this.services = new Map();
    this.blogPosts = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    this.currentProjectId = 1;
    this.currentServiceId = 1;
    this.currentBlogPostId = 1;

    // Initialize with default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Default services
    const defaultServices: InsertService[] = [
      {
        title: "Створення веб-сайтів",
        description: "Розробка сучасних та функціональних веб-сайтів під ваші потреби",
        icon: "fas fa-globe",
        features: ["Корпоративні сайти", "Інтернет-магазини", "Лендінг сторінки", "Портфоліо сайти"],
        isVisible: true,
        order: 1
      },
      {
        title: "Веб-розробка",
        description: "Створення сучасних веб-додатків із використанням React, Next.js, TypeScript",
        icon: "fas fa-laptop-code",
        features: ["Адаптивний дизайн", "SEO оптимізація", "Висока продуктивність"],
        isVisible: true,
        order: 2
      },
      {
        title: "UI/UX дизайн",
        description: "Створення інтуїтивних та привабливих користувацьких інтерфейсів",
        icon: "fas fa-mobile-alt",
        features: ["Дослідження користувачів", "Прототипування", "Дизайн системи"],
        isVisible: true,
        order: 3
      },
      {
        title: "Технічна підтримка",
        description: "Повна технічна підтримка та обслуговування ваших проектів",
        icon: "fas fa-cogs",
        features: ["Моніторинг 24/7", "Регулярні оновлення", "Оптимізація продуктивності"],
        isVisible: true,
        order: 4
      },
      {
        title: "Адміністрування сайтів",
        description: "Повне адміністрування та технічна підтримка веб-сайтів",
        icon: "fas fa-shield-alt",
        features: ["Оновлення контенту", "Технічне обслуговування", "Моніторинг безпеки", "Резервне копіювання"],
        isVisible: true,
        order: 5
      }
    ];

    // Default projects
    const defaultProjects: InsertProject[] = [
      {
        title: "Corporate Website",
        description: "Modern corporate website with admin panel",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        technologies: ["React", "Next.js", "TypeScript"],
        projectUrl: "#",
        isVisible: true,
        order: 1
      },
      {
        title: "E-commerce Store",
        description: "Full-featured online store with payment system",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        technologies: ["React", "Node.js", "MongoDB"],
        projectUrl: "#",
        isVisible: true,
        order: 2
      },
      {
        title: "Web Application",
        description: "SPA application for project management",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        technologies: ["React", "Redux", "GraphQL"],
        projectUrl: "#",
        isVisible: true,
        order: 3
      }
    ];

    // Default blog posts
    const defaultBlogPosts: InsertBlogPost[] = [
      {
        title: "Современные тренды веб-разработки в 2024 году",
        slug: "web-development-trends-2024",
        excerpt: "Обзор ключевых направлений и технологий, которые определяют будущее веб-разработки",
        content: "В 2024 году веб-разработка продолжает стремительно развиваться. React, Next.js и TypeScript остаются лидерами фронтенд-разработки, обеспечивая производительность и масштабируемость современных приложений.",
        imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        tags: ["React", "Next.js", "TypeScript", "Frontend"],
        isPublished: true,
        publishedAt: new Date(),
        order: 1
      },
      {
        title: "Оптимизация производительности веб-сайтов",
        slug: "website-performance-optimization",
        excerpt: "Практические советы по улучшению скорости загрузки и отзывчивости веб-приложений",
        content: "Производительность веб-сайта критически важна для пользовательского опыта. Рассмотрим основные методы оптимизации: сжатие изображений, минификация кода, использование CDN и кэширование.",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        tags: ["Performance", "Optimization", "SEO"],
        isPublished: true,
        publishedAt: new Date(),
        order: 2
      },
      {
        title: "Безопасность веб-приложений: лучшие практики",
        slug: "web-security-best-practices",
        excerpt: "Основные принципы защиты веб-приложений от современных угроз и уязвимостей",
        content: "Безопасность должна быть приоритетом с самого начала разработки. Важно использовать HTTPS, валидацию данных, защиту от XSS и CSRF атак, а также регулярно обновлять зависимости.",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        tags: ["Security", "HTTPS", "Authentication"],
        isPublished: true,
        publishedAt: new Date(),
        order: 3
      }
    ];

    for (const service of defaultServices) {
      await this.createService(service);
    }

    for (const project of defaultProjects) {
      await this.createProject(project);
    }

    for (const post of defaultBlogPosts) {
      await this.createBlogPost(post);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      id,
      name: insertContact.name,
      phone: insertContact.phone,
      message: insertContact.message,
      createdAt: new Date(),
      isRead: false 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async markContactAsRead(id: number): Promise<void> {
    const contact = this.contacts.get(id);
    if (contact) {
      this.contacts.set(id, { ...contact, isRead: true });
    }
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => a.order - b.order);
  }

  async getVisibleProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.isVisible)
      .sort((a, b) => a.order - b.order);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = { ...project, ...projectData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values()).sort((a, b) => a.order - b.order);
  }

  async getVisibleServices(): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter(service => service.isVisible)
      .sort((a, b) => a.order - b.order);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService: Service = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Blog Posts methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.isPublished)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    for (const post of this.blogPosts.values()) {
      if (post.slug === slug) {
        return post;
      }
    }
    return undefined;
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const blogPost: BlogPost = { 
      ...insertBlogPost, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async updateBlogPost(id: number, blogPostData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const blogPost = this.blogPosts.get(id);
    if (!blogPost) return undefined;
    
    const updatedBlogPost: BlogPost = { 
      ...blogPost, 
      ...blogPostData,
      updatedAt: new Date()
    };
    this.blogPosts.set(id, updatedBlogPost);
    return updatedBlogPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    // Return default settings for memory storage
    return {
      id: 1,
      phone: "+380959212203",
      email: "support@web-service.studio",
      address: "Україна, 52501, м.Синельникове, вул.Миру 36",
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
      footerDescription: "Професійна веб-розробка з використанням сучасних технологій",
      footerDescriptionUk: null,
      footerDescriptionRu: null,
      footerDescriptionEn: null,
      companyName: "Webservice Studio",
      logoUrl: "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    // For memory storage, just return the current settings with updates
    const current = await this.getSiteSettings();
    return { ...current, ...settings, updatedAt: new Date() };
  }
}

export const storage = new DatabaseStorage();
