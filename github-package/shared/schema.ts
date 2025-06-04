import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isActive: boolean("is_active").default(true).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lastFailedLogin: timestamp("last_failed_login"),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  titleUk: text("title_uk"),
  descriptionUk: text("description_uk"),
  titleRu: text("title_ru"),
  descriptionRu: text("description_ru"),
  titleEn: text("title_en"),
  descriptionEn: text("description_en"),
  imageUrl: text("image_url").notNull(),
  technologies: text("technologies").array().notNull(),
  projectUrl: text("project_url"),
  isVisible: boolean("is_visible").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords").array(),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonical: text("canonical"),
  structuredData: text("structured_data"),
  customHeadTags: text("custom_head_tags"),
  // SEO Translation fields
  metaTitleUk: text("meta_title_uk"),
  metaDescriptionUk: text("meta_description_uk"),
  metaKeywordsUk: text("meta_keywords_uk").array(),
  ogTitleUk: text("og_title_uk"),
  ogDescriptionUk: text("og_description_uk"),
  metaTitleRu: text("meta_title_ru"),
  metaDescriptionRu: text("meta_description_ru"),
  metaKeywordsRu: text("meta_keywords_ru").array(),
  ogTitleRu: text("og_title_ru"),
  ogDescriptionRu: text("og_description_ru"),
  // Twitter Card fields
  twitterSite: text("twitter_site"),
  twitterCreator: text("twitter_creator"),
  // Analytics fields  
  googleAnalyticsId: text("google_analytics_id"),
  googleTagManagerId: text("google_tag_manager_id"),
  facebookPixelId: text("facebook_pixel_id"),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  features: text("features").array().notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  // Translation fields
  titleUk: text("title_uk"),
  descriptionUk: text("description_uk"),
  titleRu: text("title_ru"),
  descriptionRu: text("description_ru"),
  titleEn: text("title_en"),
  descriptionEn: text("description_en"),
  featuresUk: text("features_uk").array(),
  featuresRu: text("features_ru").array(),
  featuresEn: text("features_en").array(),
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords").array(),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonical: text("canonical"),
  structuredData: text("structured_data"),
  customHeadTags: text("custom_head_tags"),
  // SEO Translation fields
  metaTitleUk: text("meta_title_uk"),
  metaDescriptionUk: text("meta_description_uk"),
  metaKeywordsUk: text("meta_keywords_uk").array(),
  ogTitleUk: text("og_title_uk"),
  ogDescriptionUk: text("og_description_uk"),
  metaTitleRu: text("meta_title_ru"),
  metaDescriptionRu: text("meta_description_ru"),
  metaKeywordsRu: text("meta_keywords_ru").array(),
  ogTitleRu: text("og_title_ru"),
  ogDescriptionRu: text("og_description_ru"),
  metaTitleEn: text("meta_title_en"),
  metaDescriptionEn: text("meta_description_en"),
  metaKeywordsEn: text("meta_keywords_en").array(),
  ogTitleEn: text("og_title_en"),
  ogDescriptionEn: text("og_description_en"),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array().notNull().default([]),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  order: integer("order").notNull().default(0),
  // Translation fields
  titleUk: text("title_uk"),
  excerptUk: text("excerpt_uk"),
  contentUk: text("content_uk"),
  titleRu: text("title_ru"),
  excerptRu: text("excerpt_ru"),
  contentRu: text("content_ru"),
  titleEn: text("title_en"),
  excerptEn: text("excerpt_en"),
  contentEn: text("content_en"),
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords").array(),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonical: text("canonical"),
  structuredData: text("structured_data"),
  customHeadTags: text("custom_head_tags"),
  // SEO Translation fields
  metaTitleUk: text("meta_title_uk"),
  metaDescriptionUk: text("meta_description_uk"),
  metaKeywordsUk: text("meta_keywords_uk").array(),
  ogTitleUk: text("og_title_uk"),
  ogDescriptionUk: text("og_description_uk"),
  metaTitleRu: text("meta_title_ru"),
  metaDescriptionRu: text("meta_description_ru"),
  metaKeywordsRu: text("meta_keywords_ru").array(),
  ogTitleRu: text("og_title_ru"),
  ogDescriptionRu: text("og_description_ru"),
  // Twitter Card fields
  twitterSite: text("twitter_site"),
  twitterCreator: text("twitter_creator"),
  // Analytics fields  
  googleAnalyticsId: text("google_analytics_id"),
  googleTagManagerId: text("google_tag_manager_id"),
  facebookPixelId: text("facebook_pixel_id"),
});

// Custom Menu Items
export const customMenuItems = pgTable("custom_menu_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  isExternal: boolean("is_external").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team Members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  
  // Multilingual fields
  nameUk: text("name_uk"),
  nameRu: text("name_ru"),
  nameEn: text("name_en"),
  
  positionUk: text("position_uk"),
  positionRu: text("position_ru"),
  positionEn: text("position_en"),
  
  descriptionUk: text("description_uk"),
  descriptionRu: text("description_ru"),
  descriptionEn: text("description_en"),
  
  // Social links
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  emailUrl: text("email_url"),
  
  // Settings
  isVisible: boolean("is_visible").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  // Contact Information
  phone: text("phone").notNull().default("+380959212203"),
  email: text("email").notNull().default("support@web-service.studio"),
  address: text("address").notNull().default("Україна, 52501, м.Синельникове, вул.Миру 36"),
  
  // Social Media Links
  facebookUrl: text("facebook_url").default(""),
  facebookVisible: boolean("facebook_visible").default(true),
  instagramUrl: text("instagram_url").default(""),
  instagramVisible: boolean("instagram_visible").default(true),
  youtubeUrl: text("youtube_url").default(""),
  youtubeVisible: boolean("youtube_visible").default(true),
  telegramUrl: text("telegram_url").default(""),
  telegramVisible: boolean("telegram_visible").default(true),
  githubUrl: text("github_url").default(""),
  githubVisible: boolean("github_visible").default(true),
  linkedinUrl: text("linkedin_url").default(""),
  linkedinVisible: boolean("linkedin_visible").default(true),
  
  // Footer Content
  footerDescription: text("footer_description").notNull().default("Професійна веб-розробка з використанням сучасних технологій"),
  footerDescriptionUk: text("footer_description_uk"),
  footerDescriptionRu: text("footer_description_ru"),
  footerDescriptionEn: text("footer_description_en"),
  
  // Company Information
  companyName: text("company_name").notNull().default("Webservice Studio"),
  logoUrl: text("logo_url").default(""),
  
  // Header Content
  heroTitle1: text("hero_title_1").notNull().default("Створюємо"),
  heroTitle2: text("hero_title_2").notNull().default("сучасні веб-рішення"),
  heroTitle3: text("hero_title_3").notNull().default("для вашого бізнесу"),
  heroDescription: text("hero_description").notNull().default("Професійна розробка веб-сайтів, мобільних додатків та цифрових рішень з використанням найсучасніших технологій"),
  
  // Hero Title 1 translations
  heroTitle1Uk: text("hero_title_1_uk"),
  heroTitle1Ru: text("hero_title_1_ru"),
  heroTitle1En: text("hero_title_1_en"),
  
  // Hero Title 2 translations
  heroTitle2Uk: text("hero_title_2_uk"),
  heroTitle2Ru: text("hero_title_2_ru"),
  heroTitle2En: text("hero_title_2_en"),
  
  // Hero Title 3 translations
  heroTitle3Uk: text("hero_title_3_uk"),
  heroTitle3Ru: text("hero_title_3_ru"),
  heroTitle3En: text("hero_title_3_en"),
  
  // Hero Description translations
  heroDescriptionUk: text("hero_description_uk"),
  heroDescriptionRu: text("hero_description_ru"),
  heroDescriptionEn: text("hero_description_en"),
  
  // Header/Navigation Settings
  showServicesMenu: boolean("show_services_menu").default(true),
  showPortfolioMenu: boolean("show_portfolio_menu").default(true),
  showAboutMenu: boolean("show_about_menu").default(true),
  showContactMenu: boolean("show_contact_menu").default(true),
  showBlogMenu: boolean("show_blog_menu").default(true),
  showAdminMenu: boolean("show_admin_menu").default(true),
  
  // About Section Content
  aboutTitle: text("about_title").notNull().default("Про нас"),
  aboutDescription: text("about_description").notNull().default("Ми команда професіоналів, що створює сучасні веб-рішення для вашого бізнесу"),
  aboutImageUrl: text("about_image_url").default("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"),
  
  // About Section translations
  aboutTitleUk: text("about_title_uk"),
  aboutTitleRu: text("about_title_ru"),
  aboutTitleEn: text("about_title_en"),
  aboutDescriptionUk: text("about_description_uk"),
  aboutDescriptionRu: text("about_description_ru"),
  aboutDescriptionEn: text("about_description_en"),

  // About Section Features (3 cards)
  feature1Title: text("feature1_title").notNull().default("Інноваційний підхід"),
  feature1Description: text("feature1_description").notNull().default("Використовуємо найсучасніші технології та методології розробки"),
  feature1Icon: text("feature1_icon").notNull().default("rocket"),
  feature1Color: text("feature1_color").notNull().default("bg-orange"),
  
  // Feature 1 translations
  feature1TitleUk: text("feature1_title_uk"),
  feature1TitleRu: text("feature1_title_ru"),
  feature1TitleEn: text("feature1_title_en"),
  feature1DescriptionUk: text("feature1_description_uk"),
  feature1DescriptionRu: text("feature1_description_ru"),
  feature1DescriptionEn: text("feature1_description_en"),
  
  feature2Title: text("feature2_title").notNull().default("Командна робота"),
  feature2Description: text("feature2_description").notNull().default("Тісна співпраця з клієнтами на всіх етапах розробки"),
  feature2Icon: text("feature2_icon").notNull().default("users"),
  feature2Color: text("feature2_color").notNull().default("bg-purple"),
  
  // Feature 2 translations
  feature2TitleUk: text("feature2_title_uk"),
  feature2TitleRu: text("feature2_title_ru"),
  feature2TitleEn: text("feature2_title_en"),
  feature2DescriptionUk: text("feature2_description_uk"),
  feature2DescriptionRu: text("feature2_description_ru"),
  feature2DescriptionEn: text("feature2_description_en"),
  
  feature3Title: text("feature3_title").notNull().default("Якість"),
  feature3Description: text("feature3_description").notNull().default("Строгий контроль якості та тестування на всіх етапах"),
  feature3Icon: text("feature3_icon").notNull().default("award"),
  feature3Color: text("feature3_color").notNull().default("bg-coral"),
  
  // Feature 3 translations
  feature3TitleUk: text("feature3_title_uk"),
  feature3TitleRu: text("feature3_title_ru"),
  feature3TitleEn: text("feature3_title_en"),
  feature3DescriptionUk: text("feature3_description_uk"),
  feature3DescriptionRu: text("feature3_description_ru"),
  feature3DescriptionEn: text("feature3_description_en"),

  // Menu Labels - simplified with auto-translation
  aboutMenu: text("about_menu").notNull().default("Про нас"),
  contactMenu: text("contact_menu").notNull().default("Контакти"),
  blogMenu: text("blog_menu").notNull().default("Блог"),
  adminMenu: text("admin_menu").notNull().default("Адмін"),
  
  // Legacy menu translation fields (kept for compatibility)
  servicesMenuUk: text("services_menu_uk"),
  servicesMenuRu: text("services_menu_ru"),
  servicesMenuEn: text("services_menu_en"),
  portfolioMenuUk: text("portfolio_menu_uk"),
  portfolioMenuRu: text("portfolio_menu_ru"),
  portfolioMenuEn: text("portfolio_menu_en"),
  aboutMenuUk: text("about_menu_uk"),
  aboutMenuRu: text("about_menu_ru"),
  aboutMenuEn: text("about_menu_en"),
  contactMenuUk: text("contact_menu_uk"),
  contactMenuRu: text("contact_menu_ru"),
  contactMenuEn: text("contact_menu_en"),
  blogMenuUk: text("blog_menu_uk"),
  blogMenuRu: text("blog_menu_ru"),
  blogMenuEn: text("blog_menu_en"),
  adminMenuUk: text("admin_menu_uk"),
  adminMenuRu: text("admin_menu_ru"),
  adminMenuEn: text("admin_menu_en"),
  
  // SEO Settings
  siteTitle: text("site_title").notNull().default("Webservice Studio"),
  siteTitleUk: text("site_title_uk"),
  siteTitleRu: text("site_title_ru"),
  siteTitleEn: text("site_title_en"),
  
  siteDescription: text("site_description").notNull().default("Професійна веб-розробка з використанням сучасних технологій"),
  siteDescriptionUk: text("site_description_uk"),
  siteDescriptionRu: text("site_description_ru"),
  siteDescriptionEn: text("site_description_en"),
  
  siteKeywords: text("site_keywords").notNull().default("веб-розробка, сайти, додатки, дизайн"),
  siteKeywordsUk: text("site_keywords_uk"),
  siteKeywordsRu: text("site_keywords_ru"),
  siteKeywordsEn: text("site_keywords_en"),
  
  siteAuthor: text("site_author").notNull().default("Webservice Studio"),
  siteLogo: text("site_logo"),
  siteUrl: text("site_url").notNull().default("https://web-service.studio"),
  
  // Open Graph Settings
  ogTitle: text("og_title"),
  ogTitleUk: text("og_title_uk"),
  ogTitleRu: text("og_title_ru"),
  ogTitleEn: text("og_title_en"),
  
  ogDescription: text("og_description"),
  ogDescriptionUk: text("og_description_uk"),
  ogDescriptionRu: text("og_description_ru"),
  ogDescriptionEn: text("og_description_en"),
  
  ogImage: text("og_image"),
  ogType: text("og_type").notNull().default("website"),
  
  // Twitter Card Settings
  twitterCard: text("twitter_card").notNull().default("summary_large_image"),
  twitterSite: text("twitter_site"),
  twitterCreator: text("twitter_creator"),
  
  // Additional Meta Tags
  robots: text("robots").notNull().default("index, follow"),
  canonical: text("canonical"),
  
  // Analytics
  googleAnalyticsId: text("google_analytics_id"),
  googleTagManagerId: text("google_tag_manager_id"),
  facebookPixelId: text("facebook_pixel_id"),
  
  // Cookie Settings
  cookieConsentEnabled: boolean("cookie_consent_enabled").notNull().default(true),
  cookieTitle: text("cookie_title").notNull().default("Ми використовуємо файли cookie"),
  cookieMessage: text("cookie_message").notNull().default("Цей сайт використовує файли cookie для покращення вашого досвіду користування. Продовжуючи використовувати сайт, ви погоджуєтесь з нашою політикою використання файлів cookie."),
  cookieAcceptText: text("cookie_accept_text").notNull().default("Прийняти"),
  cookieDeclineText: text("cookie_decline_text").notNull().default("Відхилити"),
  cookieSettingsText: text("cookie_settings_text").notNull().default("Налаштування"),
  cookiePolicyUrl: text("cookie_policy_url").notNull().default("/privacy-policy"),
  cookiePosition: text("cookie_position").notNull().default("bottom"),
  cookieTheme: text("cookie_theme").notNull().default("light"),
  
  // Cookie translations
  cookieTitleUk: text("cookie_title_uk"),
  cookieTitleRu: text("cookie_title_ru"),
  cookieTitleEn: text("cookie_title_en"),
  cookieMessageUk: text("cookie_message_uk"),
  cookieMessageRu: text("cookie_message_ru"),
  cookieMessageEn: text("cookie_message_en"),
  cookieAcceptTextUk: text("cookie_accept_text_uk"),
  cookieAcceptTextRu: text("cookie_accept_text_ru"),
  cookieAcceptTextEn: text("cookie_accept_text_en"),
  cookieDeclineTextUk: text("cookie_decline_text_uk"),
  cookieDeclineTextRu: text("cookie_decline_text_ru"),
  cookieDeclineTextEn: text("cookie_decline_text_en"),
  cookieSettingsTextUk: text("cookie_settings_text_uk"),
  cookieSettingsTextRu: text("cookie_settings_text_ru"),
  cookieSettingsTextEn: text("cookie_settings_text_en"),
  
  // Privacy Policy Settings
  privacyPolicyTitle: text("privacy_policy_title").notNull().default("Політика конфіденційності"),
  privacyPolicyTitleUk: text("privacy_policy_title_uk"),
  privacyPolicyTitleRu: text("privacy_policy_title_ru"),
  privacyPolicyTitleEn: text("privacy_policy_title_en"),
  
  privacyPolicyContent: text("privacy_policy_content").notNull().default("Базовий текст політики конфіденціальності"),
  privacyPolicyContentUk: text("privacy_policy_content_uk"),
  privacyPolicyContentRu: text("privacy_policy_content_ru"),
  privacyPolicyContentEn: text("privacy_policy_content_en"),
  
  privacyPolicyLastUpdated: text("privacy_policy_last_updated").notNull().default("грудень 2024"),
  privacyPolicyLastUpdatedUk: text("privacy_policy_last_updated_uk"),
  privacyPolicyLastUpdatedRu: text("privacy_policy_last_updated_ru"),
  privacyPolicyLastUpdatedEn: text("privacy_policy_last_updated_en"),

  // Robots.txt Settings
  robotsTxtContent: text("robots_txt_content").notNull().default(`User-agent: *
Allow: /

# Sitemap location will be automatically added

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /paypal/

# Crawl delay (optional)
Crawl-delay: 1`),
  robotsTxtCrawlDelay: integer("robots_txt_crawl_delay").notNull().default(1),
  robotsTxtDisallowPaths: text("robots_txt_disallow_paths").notNull().default("/admin,/api/,/paypal/"),

  // Homepage Head Section
  homepageMetaTags: text("homepage_meta_tags"),
  homepageHeadScripts: text("homepage_head_scripts"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  phone: true,
  message: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomMenuItemSchema = createInsertSchema(customMenuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  failedLoginAttempts: true,
  lastFailedLogin: true,
  lockedUntil: true,
});

export const loginAdminSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const changeCredentialsSchema = z.object({
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type LoginAdmin = z.infer<typeof loginAdminSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ChangeCredentials = z.infer<typeof changeCredentialsSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertCustomMenuItem = z.infer<typeof insertCustomMenuItemSchema>;
export type CustomMenuItem = typeof customMenuItems.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
