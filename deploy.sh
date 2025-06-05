#!/bin/bash

# Webservice Studio Deployment Script
# Автоматичний деплоймент на CloudPanel VPS

set -e

echo "🚀 Початок деплойменту Webservice Studio..."

# Перевіряємо чи є Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не встановлено. Встановлюємо..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker встановлено"
fi

# Перевіряємо чи є Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не встановлено. Встановлюємо..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose встановлено"
fi

# Зупиняємо поточні контейнери якщо є
if [ -f docker-compose.yml ]; then
    echo "🔄 Зупиняємо поточні контейнери..."
    docker-compose down || true
fi

# Очищуємо Docker кеш
echo "🧹 Очищуємо Docker кеш..."
docker system prune -f || true

# Створюємо папку для uploads
echo "📁 Створюємо папки..."
mkdir -p uploads
chmod 755 uploads

# Збираємо та запускаємо контейнери
echo "🔨 Збираємо Docker образи..."
docker-compose build --no-cache

echo "🚀 Запускаємо контейнери..."
docker-compose up -d

# Чекаємо запуск
echo "⏳ Чекаємо запуск сервісів..."
sleep 30

# Перевіряємо статус
echo "📊 Статус контейнерів:"
docker-compose ps

echo "📋 Логи додатку:"
docker-compose logs --tail=20 app

echo ""
echo "✅ Деплоймент завершено!"
echo ""
echo "📍 Додаток доступний за адресою:"
echo "   http://$(curl -s ifconfig.me):3000"
echo ""
echo "🔧 Адмін панель:"
echo "   URL: http://$(curl -s ifconfig.me):3000/admin"
echo "   Логін: admin"
echo "   Пароль: admin123"
echo ""
echo "📊 Для перегляду логів:"
echo "   docker-compose logs -f app"
echo ""
echo "🔄 Для перезапуску:"
echo "   docker-compose restart"
echo ""
echo "⛔ Для зупинки:"
echo "   docker-compose down"