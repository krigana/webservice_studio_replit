# Інструкції для завантаження проекту

## Спосіб 1: Через GitHub Web Interface
1. Відкрийте ваш репозиторій на GitHub
2. Натисніть "Add file" → "Upload files"
3. Перетягніть файли з папки static-deploy/ або оберіть їх
4. Додайте commit message: "Add static website files"
5. Натисніть "Commit changes"

## Спосіб 2: Через Git на локальному комп'ютері
```bash
# Якщо репозиторій ще не клоновано
git clone https://github.com/KryhanAndrii/webservice_studio_replit.git
cd webservice_studio_replit

# Додати файли
git add .
git commit -m "Add complete project files"
git push origin main
```

## Спосіб 3: Створити новий репозиторій
1. Створіть новий репозиторій на GitHub
2. Завантажте всі файли проекту
3. Налаштуйте його як основний репозиторій

## Файли для завантаження (з папки static-deploy/):
- index.html
- contact.php
- .htaccess

Ці файли готові для розгортання на будь-якому PHP хостингу.