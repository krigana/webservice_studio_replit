# Швидкий деплоймент Webservice Studio

## Готовий пакет для міграції з Replit

✅ **Усі проблеми виправлено:**
- Видалено залежності від attached_assets файлів
- Налаштовано PostgreSQL замість Neon DB
- Підготовлено Docker конфігурацію для VPS

## На GitHub репозиторії потрібно оновити:

### 1. client/src/components/header.tsx
Видалити: `import logoPath from "@assets/webservice31.png";`  
Замінити: `siteSettings?.logoUrl || logoPath` → `siteSettings?.logoUrl || ""`

### 2. client/src/components/footer.tsx  
Видалити: `import logoPath from "@assets/webservice31.png";`  
Замінити: `siteSettings?.logoUrl || logoPath` → `siteSettings?.logoUrl || ""`

## Деплоймент на CloudPanel:

```bash
# 1. Клонувати/оновити код
git clone https://github.com/krigana/webservice_studio_replit.git
cd webservice_studio_replit

# 2. Запустити автоматичний деплоймент
chmod +x deploy.sh
./deploy.sh
```

## Альтернативно вручну:
```bash
docker-compose down
docker-compose build --no-cache  
docker-compose up -d
```

## Доступ:
- **Сайт:** http://IP_СЕРВЕРА:3000
- **Адмін:** http://IP_СЕРВЕРА:3000/admin
- **Логін:** admin / admin123

## Структура:
- Frontend + Backend + PostgreSQL в Docker
- Nginx для proxy (порт 80)
- Автоматичні SSL сертифікати
- Persistent data в volumes

Повна функціональність збережена: багатомовність, адмін панель, блог, PayPal, контакти, проекти, послуги.