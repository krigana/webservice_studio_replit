#!/bin/bash

echo "Підготовка проекту для Хостингер..."

# Створюємо папку для підготовки
mkdir -p hostinger-deploy
cd hostinger-deploy

# Копіюємо всі необхідні файли
cp -r ../client .
cp -r ../server .
cp -r ../shared .
cp ../package.json .
cp ../package-lock.json .
cp ../tsconfig.json .
cp ../vite.config.ts .
cp ../tailwind.config.ts .
cp ../postcss.config.js .
cp ../components.json .
cp ../drizzle.config.ts .
cp ../.env.example .
cp ../ecosystem.config.js .
cp ../DEPLOYMENT_GUIDE.md .

# Копіюємо статичні ресурси
cp -r ../attached_assets .

echo "Файли підготовлено в папці hostinger-deploy/"
echo "Тепер створіть ZIP архів цієї папки для завантаження на Хостингер"