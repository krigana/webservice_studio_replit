# Webservice Studio - Deployment Guide

Повний гайд з розгортання проекту на різних платформах.

## 🚀 Швидкий старт

### 1. Налаштування середовища

```bash
# Клонування репозиторію
git clone https://github.com/yourusername/webservice-studio.git
cd webservice-studio

# Встановлення залежностей
npm install

# Копіювання файлу змінних середовища
cp .env.example .env
```

### 2. Конфігурація бази даних

Відредагуйте `.env` файл:

```env
# PostgreSQL підключення
DATABASE_URL=postgresql://username:password@localhost:5432/webservice_studio

# Сесії
SESSION_SECRET=your-super-secret-session-key-here

# PayPal (Sandbox для розробки)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### 3. Ініціалізація бази даних

```bash
# Створення таблиць
npm run db:push

# Опціонально: відкриття Drizzle Studio
npm run db:studio
```

### 4. Запуск проекту

```bash
# Режим розробки
npm run dev

# Збірка для продакшену
npm run build
npm run preview
```

## 🌐 Платформи розгортання

### Replit Deployment (Рекомендовано)

1. Імпортуйте проект у Replit
2. Налаштуйте змінні середовища в Secrets
3. Натисніть кнопку Deploy

**Переваги:**
- Автоматичне налаштування
- Вбудована PostgreSQL
- SSL сертифікати
- Моніторинг

### Vercel

```bash
# Встановіть Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

**Налаштування:**
- Додайте змінні середовища в панелі Vercel
- Налаштуйте зовнішню PostgreSQL базу

### Netlify

```bash
# Збірка
npm run build

# Завантажте папку dist/ у Netlify
```

**Примітка:** Netlify підтримує лише статичні сайти. Для повного функціоналу використайте Netlify Functions або інші платформи.

### Hostinger

1. **Підготовка файлів:**
```bash
npm run build
```

2. **Завантаження:**
- Завантажте вміст папки `dist/` у public_html
- Налаштуйте PHP backend (якщо потрібно)

3. **База даних:**
- Створіть MySQL базу через cPanel
- Оновіть `DATABASE_URL` у .env

### CloudPanel

1. **Створення сайту:**
```bash
# SSH підключення до сервера
ssh user@your-server.com

# Клонування проекту
git clone https://github.com/yourusername/webservice-studio.git
cd webservice-studio
```

2. **Налаштування Node.js:**
```bash
# Встановлення залежностей
npm install

# Збірка проекту
npm run build
```

3. **Налаштування PM2:**
```bash
# Встановлення PM2
npm install -g pm2

# Запуск додатку
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Налаштування Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Конфігурація середовища

### Змінні середовища

| Змінна | Обов'язкова | Опис |
|--------|-------------|------|
| `DATABASE_URL` | ✅ | PostgreSQL підключення |
| `SESSION_SECRET` | ✅ | Ключ для сесій |
| `PAYPAL_CLIENT_ID` | ⚠️ | PayPal Client ID (для донатів) |
| `PAYPAL_CLIENT_SECRET` | ⚠️ | PayPal Client Secret |
| `GOOGLE_MAPS_API_KEY` | ❌ | Google Maps API |
| `TELEGRAM_BOT_TOKEN` | ❌ | Telegram бот |

### Налаштування бази даних

**PostgreSQL (Рекомендовано):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/webservice_studio
```

**Альтернативи:**
- Supabase
- PlanetScale
- Neon
- Railway

## 🔐 Безпека

### Налаштування продакшену

1. **Змініть стандартні паролі:**
```bash
# Адмін панель: /admin
# Логін: admin
# Пароль: admin123 (змініть!)
```

2. **SSL сертифікати:**
- Let's Encrypt (безкоштовно)
- Cloudflare SSL

3. **Firewall:**
```bash
# Відкрийте лише необхідні порти
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

4. **Резервні копії:**
```bash
# Налаштуйте автоматичні бекапи БД
pg_dump webservice_studio > backup_$(date +%Y%m%d).sql
```

## 📊 Моніторинг

### PM2 процеси

```bash
# Статус процесів
pm2 status

# Перегляд логів
pm2 logs

# Перезапуск
pm2 restart all
```

### Логи Nginx

```bash
# Доступ до логів
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🐛 Вирішення проблем

### Поширені помилки

**1. База даних не підключається:**
```bash
# Перевірте підключення
psql $DATABASE_URL

# Перевірте права доступу
GRANT ALL PRIVILEGES ON DATABASE webservice_studio TO username;
```

**2. PayPal не працює:**
- Перевірте CLIENT_ID та SECRET
- Переконайтесь що використовуєте правильний endpoint (sandbox/production)
- Перевірте домен у налаштуваннях PayPal

**3. Сесії не зберігаються:**
- Перевірте SESSION_SECRET
- Переконайтесь що таблиця sessions створена
- Перевірте налаштування cookie

### Діагностика

```bash
# Перевірка статусу сервісів
systemctl status nginx
systemctl status postgresql

# Перевірка портів
netstat -tlnp | grep :5000

# Тестування API
curl -I http://localhost:5000/api/site-settings
```

## 📞 Підтримка

**Якщо виникли проблеми:**
- GitHub Issues: створіть issue з детальним описом
- Email: support@web-service.studio
- Telegram: @webservices_studio

**При створенні issue вкажіть:**
- Версію Node.js (`node --version`)
- Операційну систему
- Лог помилки
- Кроки для відтворення проблеми