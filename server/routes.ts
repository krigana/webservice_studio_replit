import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertProjectSchema, insertServiceSchema, insertBlogPostSchema, insertSiteSettingsSchema, insertCustomMenuItemSchema, insertTeamMemberSchema, loginAdminSchema, changePasswordSchema, changeCredentialsSchema } from "@shared/schema";
import { z } from "zod";
import { sendTelegramNotification } from "./telegram";
import { translateProject, translateService, translateCompanyDescription, translateBlogPost } from "./translate";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import multer from 'multer';
import { extname } from 'path';

// Функция для транслитерации кириллических символов в латинские
function transliterate(text: string): string {
  const map: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    'і': 'i', 'ї': 'yi', 'є': 'ye', 'ґ': 'g',
    'І': 'I', 'Ї': 'Yi', 'Є': 'Ye', 'Ґ': 'G'
  };

  return text
    .split('')
    .map(char => map[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Удаляем все символы кроме букв, цифр, пробелов и дефисов
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .replace(/-+/g, '-') // Заменяем множественные дефисы на одинарные
    .replace(/^-|-$/g, ''); // Удаляем дефисы в начале и конце
}

// Функция для создания slug из заголовка
function generateSlug(title: string): string {
  return transliterate(title);
}

// Configure multer for file uploads
const createUploadConfig = (subfolder: string, prefix: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = join(process.cwd(), 'client', 'public', 'uploads', subfolder);
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, prefix + '-' + uniqueSuffix + extname(file.originalname));
    }
  });
};

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';
  
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения (JPEG, JPG, PNG, GIF, WebP, SVG)'));
  }
};

// Blog image upload
const blogUpload = multer({
  storage: createUploadConfig('blog', 'blog'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// General file upload (logos, etc.)
const generalUpload = multer({ 
  storage: createUploadConfig('general', 'file'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Team image upload
const teamUpload = multer({
  storage: createUploadConfig('team', 'team'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // SEO routes - must be first to avoid Vite interception
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const siteSettings = await storage.getSiteSettings();
      const blogPosts = await storage.getPublishedBlogPosts();
      const projects = await storage.getVisibleProjects();
      const services = await storage.getVisibleServices();
      
      const baseUrl = `https://${req.get('host')}`;
      const currentDate = new Date().toISOString();
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Blog posts -->`;

      blogPosts.forEach(post => {
        const postDate = new Date(post.updatedAt).toISOString();
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const siteSettings = await storage.getSiteSettings();
      const baseUrl = `https://${req.get('host')}`;
      
      // Build robots.txt from database settings
      let robotsTxt = siteSettings.robotsTxtContent || `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /paypal/

# Crawl delay (optional)
Crawl-delay: 1`;

      // Add sitemap location
      robotsTxt += `\n\n# Sitemap location\nSitemap: ${baseUrl}/sitemap.xml`;
      
      // Add allow important pages
      robotsTxt += `\n\n# Allow important pages
Allow: /
Allow: /about
Allow: /services
Allow: /projects
Allow: /blog
Allow: /contact
Allow: /privacy-policy`;

      res.set('Content-Type', 'text/plain');
      res.send(robotsTxt);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // Health check endpoints for deployments
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.get('/status', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Webservice Studio API', timestamp: new Date().toISOString() });
  });

  // Google Maps API key endpoint
  app.get("/api/google-maps-key", (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(404).json({ error: "Google Maps API key not configured" });
      }
      res.json({ apiKey });
    } catch (error) {
      console.error("Error getting Google Maps API key:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public API routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Admin contacts routes
  app.get("/api/admin/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/admin/contacts/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markContactAsRead(parseInt(id));
      res.json({ message: "Contact marked as read" });
    } catch (error) {
      console.error("Error marking contact as read:", error);
      res.status(500).json({ message: "Failed to mark contact as read" });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const loginData = loginAdminSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(loginData.username);

      if (!admin) {
        return res.status(401).json({ message: "Неверные учетные данные" });
      }

      if (storage.isAdminLocked(admin)) {
        return res.status(423).json({ 
          message: "Аккаунт заблокирован из-за множественных неудачных попыток входа. Попробуйте позже." 
        });
      }

      const bcrypt = await import("bcryptjs");
      const isValidPassword = await bcrypt.compare(loginData.password, admin.password);

      if (!isValidPassword) {
        await storage.recordFailedLogin(admin.id);
        return res.status(401).json({ message: "Неверные учетные данные" });
      }

      // Reset failed login attempts on successful login
      await storage.resetFailedLogins(admin.id);
      await storage.updateAdminLastLogin(admin.id);

      res.json({ 
        message: "Успешный вход",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          lastLogin: admin.lastLogin
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Неверные данные", errors: error.errors });
      } else {
        console.error("Error during admin login:", error);
        res.status(500).json({ message: "Ошибка сервера" });
      }
    }
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const passwordData = changePasswordSchema.parse(req.body);
      const { adminId } = req.query;

      if (!adminId) {
        return res.status(400).json({ message: "ID администратора обязателен" });
      }

      const admin = await storage.getAdminById(parseInt(adminId as string));
      if (!admin) {
        return res.status(404).json({ message: "Администратор не найден" });
      }

      const bcrypt = await import("bcryptjs");
      const isValidCurrentPassword = await bcrypt.compare(passwordData.currentPassword, admin.password);

      if (!isValidCurrentPassword) {
        return res.status(401).json({ message: "Неверный текущий пароль" });
      }

      const updatedAdmin = await storage.updateAdminCredentials(admin.id, undefined, passwordData.newPassword);

      res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Неверные данные", errors: error.errors });
      } else {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Ошибка сервера" });
      }
    }
  });

  app.post("/api/admin/change-credentials", async (req, res) => {
    try {
      const credentialsData = changeCredentialsSchema.parse(req.body);
      const { adminId } = req.query;

      if (!adminId) {
        return res.status(400).json({ message: "ID администратора обязателен" });
      }

      const admin = await storage.getAdminById(parseInt(adminId as string));
      if (!admin) {
        return res.status(404).json({ message: "Администратор не найден" });
      }

      const bcrypt = await import("bcryptjs");
      const isValidCurrentPassword = await bcrypt.compare(credentialsData.currentPassword, admin.password);

      if (!isValidCurrentPassword) {
        return res.status(401).json({ message: "Неверный текущий пароль" });
      }

      const updatedAdmin = await storage.updateAdminCredentials(
        admin.id, 
        credentialsData.username, 
        credentialsData.newPassword
      );

      res.json({ 
        message: "Учетные данные успешно обновлены",
        admin: {
          id: updatedAdmin?.id,
          username: updatedAdmin?.username,
          email: updatedAdmin?.email
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Неверные данные", errors: error.errors });
      } else {
        console.error("Error changing credentials:", error);
        res.status(500).json({ message: "Ошибка сервера" });
      }
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      
      // Send Telegram notification
      try {
        await sendTelegramNotification({
          name: contactData.name,
          phone: contactData.phone || 'Не указан',
          message: contactData.message,
          timestamp: new Date()
        });
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
      }
      
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getVisibleProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getVisibleServices();
      console.log('📋 Current services in storage:');
      services.forEach(service => {
        console.log(`  - ID: ${service.id}, Title: "${service.title}"`);
      });
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/blog", async (req, res) => {
    try {
      const blogPosts = await storage.getPublishedBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const blogPost = await storage.getBlogPostBySlug(slug);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      console.log(`📖 Blog post data for slug "${slug}":`, {
        id: blogPost.id,
        title: blogPost.title,
        titleUk: blogPost.titleUk,
        titleRu: blogPost.titleRu,
        titleEn: blogPost.titleEn,
        content: blogPost.content?.substring(0, 100) + '...',
        contentUk: blogPost.contentUk?.substring(0, 100) + '...',
        contentRu: blogPost.contentRu?.substring(0, 100) + '...',
        contentEn: blogPost.contentEn?.substring(0, 100) + '...',
        tags: blogPost.tags
      });
      
      res.json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // Admin routes (without authentication for now)
  app.get("/api/admin/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching admin projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/admin/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });

  app.put("/api/admin/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(parseInt(id), projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Failed to update project" });
      }
    }
  });

  app.delete("/api/admin/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProject(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Services admin routes
  app.get("/api/admin/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching admin services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service" });
      }
    }
  });

  app.put("/api/admin/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(parseInt(id), serviceData);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        console.error("Error updating service:", error);
        res.status(500).json({ message: "Failed to update service" });
      }
    }
  });

  app.delete("/api/admin/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteService(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Blog admin routes
  app.get("/api/admin/blog", async (req, res) => {
    try {
      const blogPosts = await storage.getAllBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog", async (req, res) => {
    try {
      const blogData = insertBlogPostSchema.parse(req.body);
      
      // Генерируем slug из заголовка, если он не предоставлен или содержит кириллицу
      let baseSlug = blogData.slug;
      if (!baseSlug || /[а-яё]/i.test(baseSlug)) {
        baseSlug = generateSlug(blogData.title);
      }
      
      // Генерируем уникальный slug если такой уже существует
      let uniqueSlug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existingPost = await storage.getBlogPostBySlug(uniqueSlug);
        if (!existingPost) {
          break;
        }
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const blogPostData = { 
        ...blogData, 
        slug: uniqueSlug,
        // Сохраняем основной контент как украинский
        titleUk: blogData.title,
        contentUk: blogData.content,
        excerptUk: blogData.excerpt || ''
      };
      
      const blogPost = await storage.createBlogPost(blogPostData);
      
      // Автоматически переводим новую статью на другие языки
      if (blogPost && (blogData.title || blogData.content || blogData.excerpt)) {
        try {
          const translations = await translateBlogPost(
            blogPost.titleUk || blogPost.title,
            blogPost.excerptUk || blogPost.excerpt || '',
            blogPost.contentUk || blogPost.content || '',
            'uk'
          );
          
          // Обновляем статью с переводами
          const updatedBlogPost = await storage.updateBlogPost(blogPost.id, {
            titleRu: translations.ru.title,
            titleEn: translations.en.title,
            excerptRu: translations.ru.excerpt,
            excerptEn: translations.en.excerpt,
            contentRu: translations.ru.content,
            contentEn: translations.en.content,
          });
          
          console.log(`📝 Created blog post ${blogPost.id} with auto-translated content`);
          res.status(201).json(updatedBlogPost || blogPost);
        } catch (error) {
          console.error("Error auto-translating new blog post:", error);
          res.status(201).json(blogPost);
        }
      } else {
        res.status(201).json(blogPost);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error creating blog post:", error);
        res.status(500).json({ message: "Failed to create blog post" });
      }
    }
  });

  app.put("/api/admin/blog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const blogData = insertBlogPostSchema.partial().parse(req.body);
      
      // Если обновляется заголовок и slug содержит кириллицу, регенерируем slug
      if (blogData.title && blogData.slug && /[а-яё]/i.test(blogData.slug)) {
        let baseSlug = generateSlug(blogData.title);
        let uniqueSlug = baseSlug;
        let counter = 1;
        
        while (true) {
          const existingPost = await storage.getBlogPostBySlug(uniqueSlug);
          if (!existingPost || existingPost.id === parseInt(id)) {
            break;
          }
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        blogData.slug = uniqueSlug;
      }
      
      const blogPost = await storage.updateBlogPost(parseInt(id), blogData);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(blogPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error updating blog post:", error);
        res.status(500).json({ message: "Failed to update blog post" });
      }
    }
  });

  app.patch("/api/admin/blog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const blogData = insertBlogPostSchema.partial().parse(req.body);
      
      // Если обновляется основной заголовок или содержимое, обновляем украинскую версию (основная)
      // и автоматически переводим на другие языки
      if (blogData.title || blogData.content || blogData.excerpt) {
        blogData.titleUk = blogData.title || blogData.titleUk;
        blogData.contentUk = blogData.content || blogData.contentUk;
        blogData.excerptUk = blogData.excerpt || blogData.excerptUk;
        
        // Запускаем автоматический перевод после обновления основной записи
        const blogPost = await storage.updateBlogPost(parseInt(id), blogData);
        
        if (blogPost && (blogData.title || blogData.content || blogData.excerpt)) {
          // Получаем свежие данные из базы и переводим обновленный контент на другие языки
          try {
            const freshBlogPost = await storage.getBlogPostBySlug(blogPost.slug);
            if (freshBlogPost) {
              const translations = await translateBlogPost(
                freshBlogPost.titleUk || freshBlogPost.title,
                freshBlogPost.excerptUk || freshBlogPost.excerpt || '',
                freshBlogPost.contentUk || freshBlogPost.content || '',
                'uk'
              );
              
              // Обновляем переводы
              const finalBlogPost = await storage.updateBlogPost(parseInt(id), {
                titleRu: translations.ru.title,
                titleEn: translations.en.title,
                excerptRu: translations.ru.excerpt,
                excerptEn: translations.en.excerpt,
                contentRu: translations.ru.content,
                contentEn: translations.en.content,
              });
              
              console.log(`📝 Updated blog post ${id} with auto-translated content`);
              res.json(finalBlogPost);
              return;
            }
          } catch (error) {
            console.error("Error auto-translating blog post:", error);
          }
        }
        
        res.json(blogPost);
        return;
      }
      
      const blogPost = await storage.updateBlogPost(parseInt(id), blogData);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      console.log(`📝 Updated blog post ${id} with synchronized localized content`);
      res.json(blogPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      } else {
        console.error("Error updating blog post:", error);
        res.status(500).json({ message: "Failed to update blog post" });
      }
    }
  });

  app.delete("/api/admin/blog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogPost(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Эндпоинт для исправления всех slug с кириллицей
  app.post("/api/admin/blog/fix-slugs", async (req, res) => {
    try {
      const allPosts = await storage.getAllBlogPosts();
      const updatedPosts = [];
      
      for (const post of allPosts) {
        // Проверяем, содержит ли slug кириллические символы
        if (/[а-яё]/i.test(post.slug)) {
          let baseSlug = generateSlug(post.title);
          let uniqueSlug = baseSlug;
          let counter = 1;
          
          // Проверяем уникальность нового slug
          while (true) {
            const existingPost = await storage.getBlogPostBySlug(uniqueSlug);
            if (!existingPost || existingPost.id === post.id) {
              break;
            }
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
          }
          
          // Обновляем статью с новым slug
          const updatedPost = await storage.updateBlogPost(post.id, { slug: uniqueSlug });
          if (updatedPost) {
            updatedPosts.push({
              id: post.id,
              title: post.title,
              oldSlug: post.slug,
              newSlug: uniqueSlug
            });
          }
        }
      }
      
      res.json({
        message: `Fixed ${updatedPosts.length} blog post slugs`,
        updatedPosts
      });
    } catch (error) {
      console.error("Error fixing blog post slugs:", error);
      res.status(500).json({ message: "Failed to fix blog post slugs" });
    }
  });

  // File upload routes
  app.post('/api/admin/upload/blog-image', blogUpload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const imageUrl = `/uploads/blog/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.post('/api/admin/upload/team-image', teamUpload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const imageUrl = `/uploads/team/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.post('/api/admin/upload/logo', generalUpload.single('logo'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const logoUrl = `/uploads/general/${req.file.filename}`;
    res.json({ logoUrl });
  });

  app.post('/api/admin/upload/seo-image', generalUpload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const imageUrl = `/uploads/general/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Custom Menu Items admin routes
  app.get("/api/admin/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getAllCustomMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/admin/menu-items", async (req, res) => {
    try {
      const menuItemData = insertCustomMenuItemSchema.parse(req.body);
      const menuItem = await storage.createCustomMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        console.error("Error creating menu item:", error);
        res.status(500).json({ message: "Failed to create menu item" });
      }
    }
  });

  app.patch("/api/admin/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const menuItemData = insertCustomMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateCustomMenuItem(parseInt(id), menuItemData);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        console.error("Error updating menu item:", error);
        res.status(500).json({ message: "Failed to update menu item" });
      }
    }
  });

  app.delete("/api/admin/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCustomMenuItem(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Public API for custom menu items
  app.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getVisibleCustomMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching visible menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  // Team members routes
  app.get("/api/admin/team", async (req, res) => {
    try {
      const teamMembers = await storage.getAllTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/team", async (req, res) => {
    try {
      const teamMembers = await storage.getVisibleTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching visible team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/admin/team", async (req, res) => {
    try {
      const teamMemberData = insertTeamMemberSchema.parse(req.body);
      const teamMember = await storage.createTeamMember(teamMemberData);
      res.status(201).json(teamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid team member data", errors: error.errors });
      } else {
        console.error("Error creating team member:", error);
        res.status(500).json({ message: "Failed to create team member" });
      }
    }
  });

  app.put("/api/admin/team/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const teamMemberData = insertTeamMemberSchema.partial().parse(req.body);
      const teamMember = await storage.updateTeamMember(parseInt(id), teamMemberData);
      
      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(teamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid team member data", errors: error.errors });
      } else {
        console.error("Error updating team member:", error);
        res.status(500).json({ message: "Failed to update team member" });
      }
    }
  });

  app.patch("/api/admin/team/:id/visibility", async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;
      
      const teamMember = await storage.updateTeamMember(parseInt(id), { isVisible });
      
      if (!teamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(teamMember);
    } catch (error) {
      console.error("Error updating team member visibility:", error);
      res.status(500).json({ message: "Failed to update team member visibility" });
    }
  });

  app.delete("/api/admin/team/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTeamMember(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json({ message: "Team member deleted successfully" });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Site settings
  app.put("/api/admin/site-settings", async (req, res) => {
    try {
      const settingsData = insertSiteSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSiteSettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        console.error("Error updating site settings:", error);
        res.status(500).json({ message: "Failed to update site settings" });
      }
    }
  });

  // Widget feedback admin route - only unread messages from widget
  app.get("/api/admin/widget-feedback", async (req, res) => {
    try {
      const allContacts = await storage.getAllContacts();
      // Filter only unread widget messages (containing [WIDGET] prefix and not read)
      const widgetFeedback = allContacts.filter(contact => 
        contact.message.includes('[WIDGET]') && !contact.isRead
      );
      res.json(widgetFeedback);
    } catch (error) {
      console.error("Error fetching widget feedback:", error);
      res.status(500).json({ message: "Failed to fetch widget feedback" });
    }
  });

  // Translation API route
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ message: "Text and target language are required" });
      }

      const { translateText } = await import("./translate");
      const translatedText = await translateText(text, targetLanguage);
      
      res.json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Translation failed", originalText: req.body.text });
    }
  });

  // PayPal routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  // Debug endpoint for PayPal credentials
  app.get("/api/paypal/debug", async (req, res) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    res.json({
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId ? clientId.length : 0,
      clientSecretLength: clientSecret ? clientSecret.length : 0,
      clientIdPrefix: clientId ? clientId.substring(0, 10) + "..." : "не установлен",
      environment: process.env.NODE_ENV
    });
  });

  app.post("/api/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Blog post SEO update route
  app.patch("/api/admin/blog/:id/seo", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const seoData = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }

      const updatedBlogPost = await storage.updateBlogPost(id, seoData);
      
      if (!updatedBlogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(updatedBlogPost);
    } catch (error) {
      console.error("Error updating blog post SEO:", error);
      res.status(500).json({ message: "Failed to update blog post SEO" });
    }
  });

  // Health check endpoint for Railway
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  const httpServer = createServer(app);
  return httpServer;
}