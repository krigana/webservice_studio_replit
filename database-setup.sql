-- Webservice Studio Database Setup
-- Выполните этот скрипт в phpMyAdmin или через консоль MySQL

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы сессий
CREATE TABLE IF NOT EXISTS `sessions` (
  `sid` varchar(255) NOT NULL,
  `sess` json NOT NULL,
  `expire` timestamp NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `IDX_session_expire` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы администраторов
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `role` enum('admin','moderator') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы настроек сайта
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `facebook_visible` tinyint(1) DEFAULT 1,
  `instagram_url` varchar(255) DEFAULT NULL,
  `instagram_visible` tinyint(1) DEFAULT 1,
  `youtube_url` varchar(255) DEFAULT NULL,
  `youtube_visible` tinyint(1) DEFAULT 1,
  `telegram_url` varchar(255) DEFAULT NULL,
  `telegram_visible` tinyint(1) DEFAULT 1,
  `github_url` varchar(255) DEFAULT NULL,
  `github_visible` tinyint(1) DEFAULT 1,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `linkedin_visible` tinyint(1) DEFAULT 1,
  `footer_description` text DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `hero_title1` varchar(255) DEFAULT NULL,
  `hero_title2` varchar(255) DEFAULT NULL,
  `hero_title3` varchar(255) DEFAULT NULL,
  `hero_description` text DEFAULT NULL,
  `show_services_menu` tinyint(1) DEFAULT 1,
  `show_portfolio_menu` tinyint(1) DEFAULT 1,
  `show_about_menu` tinyint(1) DEFAULT 1,
  `show_contact_menu` tinyint(1) DEFAULT 1,
  `show_blog_menu` tinyint(1) DEFAULT 1,
  `show_admin_menu` tinyint(1) DEFAULT 0,
  `about_title` varchar(255) DEFAULT NULL,
  `about_description` text DEFAULT NULL,
  `about_image_url` varchar(255) DEFAULT NULL,
  `feature1_title` varchar(255) DEFAULT NULL,
  `feature1_description` text DEFAULT NULL,
  `feature1_icon` varchar(50) DEFAULT NULL,
  `feature1_color` varchar(50) DEFAULT NULL,
  `feature2_title` varchar(255) DEFAULT NULL,
  `feature2_description` text DEFAULT NULL,
  `feature2_icon` varchar(50) DEFAULT NULL,
  `feature2_color` varchar(50) DEFAULT NULL,
  `feature3_title` varchar(255) DEFAULT NULL,
  `feature3_description` text DEFAULT NULL,
  `feature3_icon` varchar(50) DEFAULT NULL,
  `feature3_color` varchar(50) DEFAULT NULL,
  `about_menu` varchar(50) DEFAULT 'Про нас',
  `contact_menu` varchar(50) DEFAULT 'Контакти',
  `blog_menu` varchar(50) DEFAULT 'Блог',
  `admin_menu` varchar(50) DEFAULT 'Адмін',
  `site_title` varchar(255) DEFAULT NULL,
  `site_description` text DEFAULT NULL,
  `site_keywords` text DEFAULT NULL,
  `site_author` varchar(100) DEFAULT NULL,
  `site_logo` varchar(255) DEFAULT NULL,
  `site_url` varchar(255) DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text DEFAULT NULL,
  `og_image` varchar(255) DEFAULT NULL,
  `og_type` varchar(50) DEFAULT 'website',
  `twitter_card` varchar(50) DEFAULT 'summary_large_image',
  `twitter_site` varchar(50) DEFAULT NULL,
  `twitter_creator` varchar(50) DEFAULT NULL,
  `robots` varchar(100) DEFAULT 'index, follow',
  `canonical` varchar(255) DEFAULT NULL,
  `google_analytics_id` varchar(50) DEFAULT NULL,
  `google_tag_manager_id` varchar(50) DEFAULT NULL,
  `facebook_pixel_id` varchar(50) DEFAULT NULL,
  `cookie_consent_enabled` tinyint(1) DEFAULT 1,
  `cookie_title` varchar(255) DEFAULT NULL,
  `cookie_message` text DEFAULT NULL,
  `cookie_accept_text` varchar(50) DEFAULT NULL,
  `cookie_decline_text` varchar(50) DEFAULT NULL,
  `cookie_settings_text` varchar(50) DEFAULT NULL,
  `cookie_policy_url` varchar(255) DEFAULT NULL,
  `cookie_position` enum('top','bottom') DEFAULT 'bottom',
  `cookie_theme` enum('light','dark') DEFAULT 'light',
  `privacy_policy_title` varchar(255) DEFAULT NULL,
  `privacy_policy_content` longtext DEFAULT NULL,
  `privacy_policy_last_updated` varchar(50) DEFAULT NULL,
  `robots_txt_content` text DEFAULT NULL,
  `robots_txt_crawl_delay` int(11) DEFAULT 1,
  `robots_txt_disallow_paths` text DEFAULT NULL,
  `homepage_meta_tags` text DEFAULT NULL,
  `homepage_head_scripts` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы проектов
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `project_url` varchar(255) DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `technologies` json DEFAULT NULL,
  `status` enum('completed','in_progress','planned') DEFAULT 'completed',
  `is_featured` tinyint(1) DEFAULT 0,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `is_featured` (`is_featured`),
  KEY `order_index` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы услуг
CREATE TABLE IF NOT EXISTS `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `price_from` decimal(10,2) DEFAULT NULL,
  `price_to` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `is_featured` tinyint(1) DEFAULT 0,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `is_featured` (`is_featured`),
  KEY `order_index` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы блога
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `featured_image_url` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT 0,
  `tags` json DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  KEY `status` (`status`),
  KEY `is_featured` (`is_featured`),
  KEY `published_at` (`published_at`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы контактов
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','in_progress','completed','archived') DEFAULT 'new',
  `is_read` tinyint(1) DEFAULT 0,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы пунктов меню
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `is_external` tinyint(1) DEFAULT 0,
  `is_visible` tinyint(1) DEFAULT 1,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `is_visible` (`is_visible`),
  KEY `order_index` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы отзывов виджета
CREATE TABLE IF NOT EXISTS `widget_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('like','dislike') NOT NULL,
  `feedback_text` text DEFAULT NULL,
  `user_ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `page_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вставка начальных данных
INSERT INTO `admins` (`username`, `email`, `password_hash`, `first_name`, `last_name`, `role`) 
VALUES ('admin', 'admin@web-service.studio', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Вставка базовых настроек сайта
INSERT INTO `site_settings` (
  `phone`, `email`, `address`, `facebook_url`, `instagram_url`, `youtube_url`, 
  `telegram_url`, `github_url`, `linkedin_url`, `footer_description`, 
  `company_name`, `logo_url`, `hero_title1`, `hero_title2`, `hero_title3`, 
  `hero_description`, `about_title`, `about_description`, 
  `feature1_title`, `feature1_description`, `feature1_icon`, `feature1_color`,
  `feature2_title`, `feature2_description`, `feature2_icon`, `feature2_color`,
  `feature3_title`, `feature3_description`, `feature3_icon`, `feature3_color`,
  `site_title`, `site_description`, `site_keywords`, `site_author`, `site_url`
) VALUES (
  '+380959212203', 'support@web-service.studio', 'Україна, 52501, м.Синельникове, вул.Миру 36',
  'https://www.facebook.com/webservicestudio/', 'https://www.instagram.com/webservicestudio/',
  'https://www.youtube.com/channel/UCaEyCnXmwPQvnoF9f3UB3oQ', 'https://t.me/webservices_studio',
  'https://github.com/krigana', 'https://www.linkedin.com/in/krigan/',
  'Професійна веб-розробка з використанням сучасних технологій', 'Webservice Studio',
  '/webservice-logo.png', 'Створюємо', 'сучасні веб-рішення', 'для вашого бізнесу',
  'Професійна розробка веб-сайтів, мобільних додатків та цифрових рішень з використанням найсучасніших технологій',
  'Наша команда', 'Ми - команда досвідчених розробників, які створюють сучасні веб-рішення для бізнесу.',
  'Інноваційні рішення', 'Використовуємо найновіші технології для створення унікальних продуктів', 'rocket', 'bg-orange',
  'Експертна команда', 'Досвідчені фахівці з понад 5-річним стажем у веб-розробці', 'users', 'bg-purple',
  'Надійна підтримка', 'Цілодобова технічна підтримка та супровід ваших проектів', 'award', 'bg-coral',
  'Webservice Studio', 'Професійна веб-розробка з використанням сучасних технологій',
  'веб-розробка, сайти, додатки, дизайн', 'Webservice Studio', 'https://web-service.studio'
) ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Вставка базових услуг
INSERT INTO `services` (`title`, `description`, `icon`, `price_from`, `price_to`, `order_index`) VALUES
('Розробка веб-сайтів', 'Створення сучасних адаптивних веб-сайтів з використанням найновіших технологій', 'globe', 500.00, 5000.00, 1),
('Мобільні додатки', 'Розробка нативних та крос-платформених мобільних додатків для iOS та Android', 'smartphone', 1000.00, 10000.00, 2),
('E-commerce рішення', 'Повнофункціональні інтернет-магазини з системою платежів та управління товарами', 'shopping-cart', 1500.00, 15000.00, 3),
('UI/UX дизайн', 'Створення сучасного та зручного дизайну інтерфейсів для веб та мобільних додатків', 'palette', 300.00, 3000.00, 4),
('SEO оптимізація', 'Комплексна оптимізація сайту для пошукових систем та підвищення позицій', 'search', 200.00, 2000.00, 5)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Вставка тестових проектов
INSERT INTO `projects` (`title`, `description`, `image_url`, `project_url`, `technologies`, `status`, `is_featured`, `order_index`) VALUES
('Корпоративний веб-сайт', 'Сучасний корпоративний веб-сайт з адміністративною панеллю', '/uploads/projects/project1.jpg', 'https://example.com', '["React", "Node.js", "PostgreSQL"]', 'completed', 1, 1),
('Інтернет-магазин', 'Повнофункціональний інтернет-магазин з системою платежів', '/uploads/projects/project2.jpg', 'https://shop.example.com', '["Next.js", "Stripe", "MongoDB"]', 'completed', 1, 2),
('Мобільний додаток', 'Крос-платформений мобільний додаток для iOS та Android', '/uploads/projects/project3.jpg', null, '["React Native", "Firebase", "Redux"]', 'in_progress', 0, 3)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;