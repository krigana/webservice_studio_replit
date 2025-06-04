#!/bin/bash

# Створюємо мінімальний пакет для GitHub
mkdir -p github-package

# Копіюємо тільки необхідні файли
cp -r client github-package/
cp -r server github-package/
cp -r shared github-package/

# Копіюємо конфігураційні файли
cp package.json github-package/
cp package-lock.json github-package/
cp tsconfig.json github-package/
cp vite.config.ts github-package/
cp tailwind.config.ts github-package/
cp postcss.config.js github-package/
cp components.json github-package/
cp drizzle.config.ts github-package/
cp .env.example github-package/
cp ecosystem.config.js github-package/
cp DEPLOYMENT_GUIDE.md github-package/
cp .gitignore github-package/

# Копіюємо важливі зображення
mkdir -p github-package/attached_assets
cp attached_assets/webservice31.png github-package/attached_assets/ 2>/dev/null || true

echo "Пакет створено в папці github-package/"
echo "Розмір пакету:"
du -sh github-package/