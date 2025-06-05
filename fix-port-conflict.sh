#!/bin/bash

echo "🔧 Виправлення конфлікту портів..."

# Зупиняємо всі контейнери
docker-compose down

# Змінюємо порт PostgreSQL в docker-compose.yml
sed -i 's/5432:5432/5433:5432/g' docker-compose.yml

# Оновлюємо DATABASE_URL в .env файлі
if [ -f .env ]; then
    sed -i 's/:5432\//:5433\//g' .env
else
    echo "DATABASE_URL=postgresql://webservice_user:secure_password@localhost:5433/webservice_studio" > .env
fi

echo "✅ Порт PostgreSQL змінено на 5433"
echo "🚀 Перезапускаємо деплоймент..."

# Перезапускаємо
docker-compose up -d

echo "✅ Деплоймент завершено!"