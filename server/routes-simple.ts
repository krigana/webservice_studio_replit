import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertProjectSchema, insertServiceSchema, insertBlogPostSchema, insertSiteSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { sendTelegramNotification } from "./telegram";
import { translateProject, translateService } from "./translate";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import multer from 'multer';
import { extname } from 'path';

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

export async function registerRoutes(app: Express): Promise<Server> {
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
      const blogPost = await storage.createBlogPost(blogData);
      res.status(201).json(blogPost);
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

  // File upload routes
  app.post('/api/admin/upload/blog-image', blogUpload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const imageUrl = `/uploads/blog/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.post('/api/admin/upload/logo', generalUpload.single('logo'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const logoUrl = `/uploads/general/${req.file.filename}`;
    res.json({ logoUrl });
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

  const httpServer = createServer(app);
  return httpServer;
}