-- Initialize database for Webservice Studio

-- Create sessions table for express-session
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS "admins" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS "projects" (
    id SERIAL PRIMARY KEY,
    title_uk VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255),
    title_en VARCHAR(255),
    description_uk TEXT NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    image_url VARCHAR(500),
    project_url VARCHAR(500),
    technologies TEXT[],
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS "services" (
    id SERIAL PRIMARY KEY,
    title_uk VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255),
    title_en VARCHAR(255),
    description_uk TEXT NOT NULL,
    description_ru TEXT,
    description_en TEXT,
    features_uk TEXT[],
    features_ru TEXT[],
    features_en TEXT[],
    icon VARCHAR(100),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS "blog_posts" (
    id SERIAL PRIMARY KEY,
    title_uk VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255),
    title_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt_uk TEXT,
    excerpt_ru TEXT,
    excerpt_en TEXT,
    content_uk TEXT NOT NULL,
    content_ru TEXT,
    content_en TEXT,
    image_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom menu items table
CREATE TABLE IF NOT EXISTS "custom_menu_items" (
    id SERIAL PRIMARY KEY,
    title_uk VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255),
    title_en VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS "team_members" (
    id SERIAL PRIMARY KEY,
    name_uk VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255),
    name_en VARCHAR(255),
    position_uk VARCHAR(255) NOT NULL,
    position_ru VARCHAR(255),
    position_en VARCHAR(255),
    bio_uk TEXT,
    bio_ru TEXT,
    bio_en TEXT,
    image_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table
CREATE TABLE IF NOT EXISTS "site_settings" (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(255) DEFAULT 'Webservice Studio',
    company_description_uk TEXT,
    company_description_ru TEXT,
    company_description_en TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    social_facebook VARCHAR(500),
    social_twitter VARCHAR(500),
    social_linkedin VARCHAR(500),
    social_github VARCHAR(500),
    meta_title_uk VARCHAR(255),
    meta_title_ru VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_description_uk TEXT,
    meta_description_ru TEXT,
    meta_description_en TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT site_settings_singleton CHECK (id = 1)
);

-- Insert default admin user (password: admin123)
INSERT INTO "admins" (username, password) 
VALUES ('admin', '$2b$10$rOjWoXkz7Nv4QCFJNFKzXe8m9X7LQo9J5YvKH2LQF4M5P6kzXQyoK')
ON CONFLICT (username) DO NOTHING;

-- Insert default site settings
INSERT INTO "site_settings" (
    company_name,
    company_description_uk,
    company_description_ru,
    company_description_en,
    contact_email
) VALUES (
    'Webservice Studio',
    'Професійна веб-розробка та дизайн',
    'Профессиональная веб-разработка и дизайн',
    'Professional web development and design',
    'info@web-service.studio'
) ON CONFLICT (id) DO NOTHING;