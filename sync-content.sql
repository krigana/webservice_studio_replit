-- Sync Content Script для копирования точного содержимого с Replit на хостинг
-- Выполните этот скрипт ПОСЛЕ основного database-setup.sql

-- Обновление настроек сайта с текущими данными
UPDATE `site_settings` SET
  `phone` = '+380959212203',
  `email` = 'support@web-service.studio', 
  `address` = 'Україна, 52501, м.Синельникове, вул.Миру 36',
  `facebook_url` = 'https://www.facebook.com/webservicestudio/',
  `facebook_visible` = 1,
  `instagram_url` = 'https://www.instagram.com/webservicestudio/',
  `instagram_visible` = 1,
  `youtube_url` = 'https://www.youtube.com/channel/UCaEyCnXmwPQvnoF9f3UB3oQ',
  `youtube_visible` = 1,
  `telegram_url` = 'https://t.me/webservices_studio',
  `telegram_visible` = 1,
  `github_url` = 'https://github.com/krigana',
  `github_visible` = 1,
  `linkedin_url` = 'https://www.linkedin.com/in/krigan/',
  `linkedin_visible` = 1,
  `footer_description` = 'Професійна веб-розробка з використанням сучасних технологій',
  `company_name` = 'Webservice Studio',
  `logo_url` = '/webservice-logo.png',
  `hero_title1` = 'Створюємо',
  `hero_title2` = 'сучасні веб-рішення', 
  `hero_title3` = 'для вашого бізнесу',
  `hero_description` = 'Професійна розробка веб-сайтів, мобільних додатків та цифрових рішень з використанням найсучасніших технологій',
  `show_services_menu` = 1,
  `show_portfolio_menu` = 1,
  `show_about_menu` = 1,
  `show_contact_menu` = 1,
  `show_blog_menu` = 1,
  `show_admin_menu` = 0,
  `about_title` = 'Наша команда',
  `about_description` = 'Ми - команда досвідчених розробників, які створюють сучасні веб-рішення для бізнесу. Наш досвід та індивідуальний підхід до кожного проекту забезпечують високу якість та ефективність результату.',
  `about_image_url` = '/uploads/team/team-1748686191825-573980070.png',
  `feature1_title` = 'Інноваційні рішення',
  `feature1_description` = 'Використовуємо найновіші технології для створення унікальних продуктів',
  `feature1_icon` = 'rocket',
  `feature1_color` = 'bg-orange',
  `feature2_title` = 'Експертна команда',
  `feature2_description` = 'Досвідчені фахівці з понад 5-річним стажем у веб-розробці',
  `feature2_icon` = 'users',
  `feature2_color` = 'bg-purple',
  `feature3_title` = 'Надійна підтримка',
  `feature3_description` = 'Цілодобова технічна підтримка та супровід ваших проектів',
  `feature3_icon` = 'award',
  `feature3_color` = 'bg-coral',
  `about_menu` = 'Про нас',
  `contact_menu` = 'Контакти',
  `blog_menu` = 'Блог',
  `admin_menu` = 'Адмін',
  `site_title` = 'Webservice Studio',
  `site_description` = 'Професійна веб-розробка з використанням сучасних технологій',
  `site_keywords` = 'веб-розробка, сайти, додатки, дизайн',
  `site_author` = 'Webservice Studio',
  `site_url` = 'https://web-service.studio',
  `og_image` = '/uploads/general/file-1748881348888-600915725.png',
  `og_type` = 'website',
  `twitter_card` = 'summary_large_image',
  `robots` = 'index, follow',
  `cookie_consent_enabled` = 1,
  `cookie_title` = 'Ми використовуємо файли cookie',
  `cookie_message` = 'Цей сайт використовує файли cookie для покращення вашого досвіду користування. Продовжуючи використовувати сайт, ви погоджуєтесь з нашою політикою використання файлів cookie.',
  `cookie_accept_text` = 'Прийняти',
  `cookie_decline_text` = 'Відхилити',
  `cookie_settings_text` = 'Налаштування',
  `cookie_policy_url` = '/privacy-policy',
  `cookie_position` = 'bottom',
  `cookie_theme` = 'light',
  `privacy_policy_title` = 'Політика конфіденційності',
  `privacy_policy_content` = '<h2>1. ОБЩИЕ ПОЛОЖЕНИЯ</h2><p>Эта Политика конфиденциальности описывает, как компания Webservice Studio собирает, использует, хранит и защищает персональные данные посетителей нашего веб-сайта и клиентов при использовании наших услуг веб-разработки.</p><h2>2. СБОР ПЕРСОНАЛЬНЫХ ДАННЫХ</h2><p>Мы можем собирать следующие типы персональных данных:</p><ul><li>Контактная информация: имя, фамилия, адрес электронной почты, номер телефона</li><li>Информация о компании: название организации, должность, сфера деятельности</li><li>Техническая информация: IP-адрес, тип браузера, операционная система</li><li>Данные об использовании сайта: страницы, которые вы посещаете, время пребывания на сайте</li></ul><h2>3. ЦЕЛЬ ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ</h2><p>Мы используем ваши персональные данные для:</p><ul><li>Предоставления консультаций и разработки веб-решений</li><li>Общения с клиентами и потенциальными клиентами</li><li>Улучшения качества наших услуг</li><li>Маркетинговых целей (с вашего согласия)</li><li>Выполнения договорных обязательств</li></ul><h2>4. ЗАЩИТА ПЕРСОНАЛЬНЫХ ДАННЫХ</h2><p>Мы внедряем технические и организационные меры для защиты ваших персональных данных:</p><ul><li>Шифрование данных при передаче (SSL/TLS)</li><li>Ограниченный доступ к персональным данным</li><li>Регулярное обновление систем безопасности</li><li>Обучение персонала вопросам конфиденциальности</li></ul><h2>5. ВАШИ ПРАВА</h2><p>Согласно законодательству о защите персональных данных, вы имеете право:</p><ul><li>Получать информацию об обработке ваших персональных данных</li><li>Требовать внесения изменений или удаления персональных данных</li><li>Отзывать согласие на обработку данных</li><li>Подавать жалобы в соответствующие органы</li></ul><h2>6. КОНТАКТНАЯ ИНФОРМАЦИЯ</h2><p>Если у вас есть вопросы относительно обработки персональных данных или вы хотите воспользоваться своими правами, свяжитесь с нами через контактную информацию, указанную в разделе контактов нашего сайта.</p>',
  `privacy_policy_last_updated` = 'грудень 2025',
  `robots_txt_content` = 'User-agent: *\nAllow: /\n\n# Sitemap location will be automatically added\n\n# Disallow admin and API routes\nDisallow: /admin\nDisallow: /api/\nDisallow: /paypal/\n\n# Crawl delay (optional)\nCrawl-delay: 1',
  `robots_txt_crawl_delay` = 1,
  `robots_txt_disallow_paths` = '/admin,/api/,/paypal/',
  `updated_at` = CURRENT_TIMESTAMP
WHERE `id` = 1;

-- Очистка и обновление услуг
DELETE FROM `services`;
INSERT INTO `services` (`id`, `title`, `description`, `icon`, `price_from`, `price_to`, `currency`, `is_featured`, `order_index`) VALUES
(1, 'Розробка веб-сайтів', 'Створення сучасних адаптивних веб-сайтів з використанням найновіших технологій', 'globe', 500.00, 5000.00, 'USD', 0, 1),
(2, 'Мобільні додатки', 'Розробка нативних та крос-платформних мобільних додатків для iOS та Android', 'smartphone', 1000.00, 10000.00, 'USD', 0, 2),
(3, 'E-commerce рішення', 'Повнофункціональні інтернет-магазини з системою платежів та управління товарами', 'shopping-cart', 1500.00, 15000.00, 'USD', 0, 3),
(4, 'UI/UX дизайн', 'Створення сучасного та зручного дизайну інтерфейсів для веб та мобільних додатків', 'palette', 300.00, 3000.00, 'USD', 0, 4),
(5, 'SEO оптимізація', 'Комплексна оптимізація сайту для пошукових систем та підвищення позицій', 'search', 200.00, 2000.00, 'USD', 0, 5),
(7, 'Нова тестова послуга', 'Опис нової тестової послуги', 'settings', 100.00, 1000.00, 'USD', 0, 6);

-- Очистка и обновление проектов
DELETE FROM `projects`;
INSERT INTO `projects` (`id`, `title`, `description`, `image_url`, `project_url`, `github_url`, `technologies`, `status`, `is_featured`, `order_index`) VALUES
(1, 'Тестовий проект перший', 'Опис першого тестового проекту', '/uploads/projects/project-1748684449749-264966491.png', 'https://example.com', 'https://github.com/example', '["React", "Node.js", "TypeScript"]', 'completed', 1, 1),
(2, 'Корпоративний веб-сайт', 'Сучасний корпоративний веб-сайт з адміністративною панеллю', '/uploads/projects/project-1748684461644-264966491.png', 'https://corporate.example.com', 'https://github.com/corporate', '["Next.js", "PostgreSQL", "Tailwind"]', 'completed', 1, 2),
(3, 'Інтернет-магазин', 'Повнофункціональний інтернет-магазин з системою платежів', '/uploads/projects/project-1748684472777-264966491.png', 'https://shop.example.com', 'https://github.com/shop', '["React", "Stripe", "MongoDB"]', 'in_progress', 0, 3);

-- Создание примеров блог постов
INSERT INTO `blog_posts` (`title`, `slug`, `content`, `excerpt`, `featured_image_url`, `author_id`, `status`, `is_featured`, `tags`, `meta_title`, `meta_description`, `published_at`) VALUES
('Тренды веб-разработки 2025', 'trends-web-development-2025', '<p>В 2025 году веб-разработка продолжает эволюционировать с невероятной скоростью. Рассмотрим основные тренды, которые определяют будущее отрасли.</p><h2>Искусственный интеллект в разработке</h2><p>ИИ-инструменты становятся неотъемлемой частью процесса разработки, помогая автоматизировать рутинные задачи и улучшать качество кода.</p>', 'Обзор основных трендов веб-разработки в 2025 году', '/uploads/blog/blog-post-1.jpg', 1, 'published', 1, '["веб-разработка", "тренды", "2025", "технологии"]', 'Тренды веб-разработки 2025 - Webservice Studio', 'Узнайте о главных трендах веб-разработки 2025 года: ИИ, новые фреймворки, производительность и многое другое', NOW()),
('Оптимизация производительности React приложений', 'react-performance-optimization', '<p>Производительность React приложений - критически важный аспект современной веб-разработки. В этой статье рассмотрим практические методы оптимизации.</p><h2>Мемоизация компонентов</h2><p>Использование React.memo и useMemo помогает избежать ненужных перерендеров.</p>', 'Практические советы по оптимизации производительности React приложений', '/uploads/blog/blog-post-2.jpg', 1, 'published', 1, '["React", "оптимизация", "производительность", "frontend"]', 'Оптимизация производительности React', 'Практические методы оптимизации React приложений: мемоизация, виртуализация, ленивая загрузка', NOW()),
('Современные подходы к дизайну интерфейсов', 'modern-ui-design-approaches', '<p>UI/UX дизайн постоянно развивается. Современные подходы к дизайну интерфейсов помогают создавать более удобные и эффективные продукты.</p>', 'Изучаем современные подходы к дизайну пользовательских интерфейсов', '/uploads/blog/blog-post-3.jpg', 1, 'published', 0, '["UI", "UX", "дизайн", "интерфейс"]', 'Современные подходы к дизайну интерфейсов', 'Обзор современных подходов к UI/UX дизайну: тренды, принципы, лучшие практики', NOW());

-- Создание примеров контактов
INSERT INTO `contacts` (`name`, `email`, `phone`, `company`, `subject`, `message`, `status`, `is_read`) VALUES
('Иван Петров', 'ivan@example.com', '+380501234567', 'ТОВ Приклад', 'Разработка корпоративного сайта', 'Здравствуйте! Нас интересует разработка корпоративного веб-сайта для нашей компании. Можете связаться для обсуждения деталей?', 'new', 0),
('Мария Сидорова', 'maria@shop.com', '+380672345678', 'Интернет-магазин Мода', 'E-commerce решение', 'Нужна помощь в создании интернет-магазина одежды с системой онлайн-платежей.', 'in_progress', 1),
('Александр Козлов', 'alex@startup.ua', '+380931234567', 'StartupUA', 'Мобильное приложение', 'Ищем команду для разработки мобильного приложения для Android и iOS.', 'completed', 1);

-- Обновление AUTO_INCREMENT для таблиц
ALTER TABLE `services` AUTO_INCREMENT = 8;
ALTER TABLE `projects` AUTO_INCREMENT = 4;
ALTER TABLE `blog_posts` AUTO_INCREMENT = 4;
ALTER TABLE `contacts` AUTO_INCREMENT = 4;