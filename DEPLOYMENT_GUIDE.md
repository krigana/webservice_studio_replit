# Повний гід по деплойменту Webservice Studio

## Проблема з базою даних Neon
База даних Neon на Replit вимкнена ("endpoint is disabled"). Для деплойменту на власний сервер використовуємо PostgreSQL в Docker.

## Виправлення помилок з attached_assets

### 1. Оновити client/src/components/header.tsx
Видалити рядок:
```typescript
import logoPath from "@assets/webservice31.png";
```

Замінити:
```typescript
return siteSettings?.logoUrl || logoPath;
```
На:
```typescript
return siteSettings?.logoUrl || "";
```

### 2. Оновити client/src/components/footer.tsx
Видалити рядок:
```typescript
import logoPath from "@assets/webservice31.png";
```

Замінити:
```typescript
src={siteSettings?.logoUrl || logoPath}
```
На:
```typescript
src={siteSettings?.logoUrl || ""}
```

## Файли для деплойменту

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.simple
    ports:
      - "3000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://webservice:secure_password_2024@postgres:5432/webservice_db
      - SESSION_SECRET=WebserviceStudio2024SecretKey!@#
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=webservice_db
      - POSTGRES_USER=webservice
      - POSTGRES_PASSWORD=secure_password_2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Dockerfile.simple
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Remove attached_assets directory to avoid build errors
RUN rm -rf attached_assets

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

## Команди для деплойменту на CloudPanel

1. Оновити репозиторій:
```bash
cd webservice_studio_replit
git add .
git commit -m "Fix attached_assets dependencies"
git push origin main
```

2. На сервері:
```bash
cd webservice_studio_replit
git pull origin main
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

3. Перевірити статус:
```bash
docker-compose ps
docker-compose logs -f app
```

## Доступ до додатку
- Frontend + API: http://IP_СЕРВЕРА:3000
- API тільки: http://IP_СЕРВЕРА:3000/api
- PostgreSQL: IP_СЕРВЕРА:5432

## Адмін панель
- URL: http://IP_СЕРВЕРА:3000/admin
- Логін: admin
- Пароль: admin123

Це рішення усуває всі залежності від attached_assets файлів та забезпечує стабільний деплоймент з PostgreSQL базою даних.