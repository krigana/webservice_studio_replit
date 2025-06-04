# Webservice Studio - Повноцінний веб-сайт

Сучасна багатомовна веб-платформа з адмін панеллю, CMS, блогом та системою управління контентом.

## Функціональність

- ✅ Багатомовність (Українська, Російська, Англійська)
- ✅ Адмін панель з аутентифікацією
- ✅ Система управління контентом (CMS)
- ✅ Блог з редактором
- ✅ Управління проектами та послугами
- ✅ Форма зворотного зв'язку
- ✅ PayPal інтеграція для донатів
- ✅ Мобільна адаптивність
- ✅ SEO оптимізація
- ✅ GDPR сумісність

## Технології

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **База даних**: PostgreSQL
- **ORM**: Drizzle ORM
- **Контейнеризація**: Docker, Docker Compose
- **Веб-сервер**: Nginx

## Швидкий старт

### 1. Клонування репозиторію
```bash
git clone https://github.com/krigana/webservice_studio_replit.git
cd webservice_studio_replit
```

### 2. Запуск на VPS/Cloud сервері
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Налаштування DNS
Додайте A-запис домену на IP вашого сервера

## Детальні інструкції

Дивіться [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) для повних інструкцій з deployment на VPS/Cloud сервері.

## Вимоги до сервера

- **Мінімум**: 2 vCPU, 4GB RAM, 20GB SSD
- **ОС**: Ubuntu 20.04+, CentOS 8+, Debian 11+
- **Софт**: Docker, Docker Compose

## Рекомендовані провайдери

- DigitalOcean ($20/міс)
- AWS EC2 (t3.medium)
- Google Cloud Platform
- Vultr ($12/міс)
- Linode ($12/міс)

## Структура проекту

```
├── client/          # React фронтенд
├── server/          # Express бекенд
├── shared/          # Спільні типи та схеми
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── init.sql
└── deploy.sh
```

## Доступ до адмін панелі

- URL: `https://ваш-домен.com/admin`
- Логін: `admin`
- Пароль: `admin123`

**Обов'язково змініть пароль після першого входу!**

## Керування

```bash
# Статус сервісів
docker-compose ps

# Перегляд логів
docker-compose logs -f

# Перезапуск
docker-compose restart

# Зупинка
docker-compose down
```

## Backup бази даних

```bash
# Створення backup
docker-compose exec postgres pg_dump -U webservice webservice_db > backup.sql

# Відновлення
docker-compose exec -T postgres psql -U webservice webservice_db < backup.sql
```

## API Endpoints

- `GET /api/projects` - Список проектів
- `GET /api/services` - Список послуг
- `GET /api/blog` - Список блог постів
- `POST /api/contact` - Форма зворотного зв'язку
- `POST /api/admin/login` - Вхід в адмін панель

## Налаштування

### Зміна паролів
Відредагуйте `docker-compose.yml`:
- `SESSION_SECRET` - секретний ключ сесій
- `POSTGRES_PASSWORD` - пароль бази даних

### API ключі (опціонально)
- `GOOGLE_TRANSLATE_API_KEY` - для автоперекладу
- `TELEGRAM_BOT_TOKEN` - для Telegram уведомлень
- `PAYPAL_CLIENT_ID` - для PayPal донатів
- `PAYPAL_CLIENT_SECRET` - для PayPal донатів

## SSL сертифікати

### Let's Encrypt (рекомендовано)
```bash
sudo certbot certonly --standalone -d ваш-домен.com
```

### Самопідписаний (для тестування)
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/web-service.studio.key \
  -out ssl/web-service.studio.crt
```

## Проблеми та рішення

### Контейнер не запускається
```bash
docker-compose logs app
```

### База недоступна
```bash
docker-compose restart postgres
```

### SSL помилки
```bash
docker-compose restart nginx
```

## Ліцензія

MIT License

## Підтримка

Для питань по deployment та налаштуванню:
1. Перевірте логи: `docker-compose logs -f`
2. Переконайтеся що DNS налаштовано
3. Перевірте firewall налаштування