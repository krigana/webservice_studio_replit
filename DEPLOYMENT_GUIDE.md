# Webservice Studio - Повний Deployment Guide

## Вимоги до сервера

### Мінімальні характеристики VPS/Cloud сервера:
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Network**: Публічний IP адрес

### Рекомендовані провайдери:
- DigitalOcean (Droplet $20/міс)
- AWS EC2 (t3.medium)
- Google Cloud Platform (e2-medium)
- Vultr ($12/міс)
- Linode ($12/міс)

## Кроки розгортання

### 1. Підготовка сервера

```bash
# Оновлення системи
sudo apt update && sudo apt upgrade -y

# Встановлення Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Встановлення Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезавантаження для застосування змін
sudo reboot
```

### 2. Завантаження проекту

```bash
# Клонування з GitHub
git clone https://github.com/krigana/webservice_studio_replit.git
cd webservice_studio_replit

# Або завантаження архіву
wget https://github.com/krigana/webservice_studio_replit/archive/main.zip
unzip main.zip
cd webservice_studio_replit-main
```

### 3. Налаштування SSL сертифікатів

#### Опція A: Let's Encrypt (безкоштовно)
```bash
# Встановлення Certbot
sudo apt install certbot

# Отримання сертифікату
sudo certbot certonly --standalone -d web-service.studio -d www.web-service.studio

# Копіювання сертифікатів
mkdir -p ssl
sudo cp /etc/letsencrypt/live/web-service.studio/fullchain.pem ssl/web-service.studio.crt
sudo cp /etc/letsencrypt/live/web-service.studio/privkey.pem ssl/web-service.studio.key
sudo chmod 644 ssl/*
```

#### Опція B: Самопідписаний сертифікат (для тестування)
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/web-service.studio.key \
  -out ssl/web-service.studio.crt \
  -subj "/C=UA/ST=Kyiv/L=Kyiv/O=Webservice Studio/CN=web-service.studio"
```

### 4. Налаштування environment змінних

Відредагуйте `docker-compose.yml` та змініть:
- `SESSION_SECRET` на унікальний ключ
- `POSTGRES_PASSWORD` на надійний пароль
- Додайте API ключі якщо потрібно:
  - `GOOGLE_TRANSLATE_API_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`

### 5. Запуск додатку

```bash
# Надання прав на виконання
chmod +x deploy.sh

# Запуск deployment
./deploy.sh
```

### 6. Налаштування DNS

У панелі управління доменом web-service.studio додайте A-запис:
```
Type: A
Name: @
Value: [IP_АДРЕСА_СЕРВЕРА]
TTL: 300

Type: A  
Name: www
Value: [IP_АДРЕСА_СЕРВЕРА]
TTL: 300
```

### 7. Перевірка роботи

Відкрийте в браузері:
- `https://web-service.studio` - головна сторінка
- `https://web-service.studio/admin` - адмін панель

**Дані для входу в адмін панель:**
- Логін: `admin`
- Пароль: `admin123`

## Керування додатком

### Основні команди Docker Compose:

```bash
# Перегляд статусу
docker-compose ps

# Перегляд логів
docker-compose logs -f

# Перезапуск
docker-compose restart

# Зупинка
docker-compose down

# Зупинка з видаленням даних
docker-compose down -v

# Оновлення додатку
git pull
docker-compose build --no-cache
docker-compose up -d
```

### Backup бази даних:

```bash
# Створення backup
docker-compose exec postgres pg_dump -U webservice webservice_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Відновлення з backup
docker-compose exec -T postgres psql -U webservice webservice_db < backup_file.sql
```

## Моніторинг та обслуговування

### Автоматичне оновлення SSL сертифікатів:

```bash
# Додати в crontab
sudo crontab -e

# Додати рядок:
0 2 * * 1 certbot renew && docker-compose restart nginx
```

### Моніторинг ресурсів:

```bash
# Використання ресурсів контейнерами
docker stats

# Розмір дисків
df -h

# Використання пам'яті
free -h
```

## Безпека

### Рекомендації:
1. Змініть стандартний пароль адміністратора
2. Налаштуйте firewall (ufw або iptables)
3. Оновлюйте система регулярно
4. Використовуйте надійні паролі
5. Налаштуйте регулярні backup

### Налаштування Firewall:

```bash
# Встановлення UFW
sudo ufw enable

# Дозволити необхідні порти
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Заблокувати прямий доступ до бази
sudo ufw deny 5432/tcp
```

## Часті проблеми та рішення

### Проблема: Контейнер не запускається
```bash
# Перевірка логів
docker-compose logs app

# Перевірка портів
sudo netstat -tulpn | grep :80
```

### Проблема: База даних недоступна
```bash
# Перевірка статусу PostgreSQL
docker-compose exec postgres pg_isready

# Перезапуск бази даних
docker-compose restart postgres
```

### Проблема: SSL помилки
```bash
# Перевірка сертифікатів
openssl x509 -in ssl/web-service.studio.crt -text -noout

# Оновлення Nginx конфігурації
docker-compose restart nginx
```

## Контакти підтримки

Якщо виникли проблеми з deployment:
1. Перевірте логи: `docker-compose logs -f`
2. Переконайтеся що DNS налаштовано правильно
3. Перевірте що всі порти відкриті в firewall
4. Зверніться до документації провайдера VPS

---

**Після успішного deployment ваш повноцінний сайт web-service.studio буде працювати з усіма функціями: адмін панель, CMS, блог, багатомовність, PayPal донати, мобільна версія.**