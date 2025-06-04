# Швидкий Deployment - Webservice Studio

## Крок 1: Підготовка сервера (Ubuntu/Debian)

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

# Перезавантаження
sudo reboot
```

## Крок 2: Завантаження проекту

```bash
git clone https://github.com/krigana/webservice_studio_replit.git
cd webservice_studio_replit
```

## Крок 3: SSL сертифікати

### Самопідписаний (для тестування):
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/web-service.studio.key \
  -out ssl/web-service.studio.crt \
  -subj "/C=UA/ST=Kyiv/L=Kyiv/O=Webservice Studio/CN=web-service.studio"
```

### Let's Encrypt (для production):
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d web-service.studio -d www.web-service.studio
mkdir -p ssl
sudo cp /etc/letsencrypt/live/web-service.studio/fullchain.pem ssl/web-service.studio.crt
sudo cp /etc/letsencrypt/live/web-service.studio/privkey.pem ssl/web-service.studio.key
sudo chmod 644 ssl/*
```

## Крок 4: Запуск

```bash
chmod +x deploy.sh
./deploy.sh
```

## Крок 5: DNS налаштування

Додайте A-запис в DNS домену:
- **Type**: A
- **Name**: @
- **Value**: IP_АДРЕСА_СЕРВЕРА
- **TTL**: 300

Додайте www запис:
- **Type**: A
- **Name**: www
- **Value**: IP_АДРЕСА_СЕРВЕРА
- **TTL**: 300

## Готово!

Відкрийте `https://web-service.studio` - ваш сайт працює!

Адмін панель: `https://web-service.studio/admin`
- Логін: `admin`
- Пароль: `admin123`

## Керування

```bash
# Статус
docker-compose ps

# Логи
docker-compose logs -f

# Перезапуск
docker-compose restart

# Зупинка
docker-compose down
```