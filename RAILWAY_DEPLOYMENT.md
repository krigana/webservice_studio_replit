# Розгортання на Railway

## Крок 1: Підготовка GitHub репозиторію

1. Створіть новий GitHub репозиторій
2. Завантажте всі файли проекту (можна скачати як ZIP з Replit)
3. **Важливо:** Видаліть папку `node_modules` якщо вона є
4. Пуш код в репозиторій:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Крок 2: Налаштування Railway

1. Перейдіть на https://railway.app/
2. Увійдіть через GitHub
3. Натисніть "New Project"
4. Виберіть "Deploy from GitHub repo"
5. Оберіть ваш репозиторій

## Крок 3: Додавання PostgreSQL бази даних

1. В проекті натисніть "Add Service"
2. Виберіть "Database" → "PostgreSQL"
3. Railway автоматично створить базу даних
4. Скопіюйте DATABASE_URL з Variables

## Крок 4: Налаштування змінних середовища

В розділі Variables додайте:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (автоматично створюється Railway)

# Ваші API ключі
GOOGLE_MAPS_API_KEY=your_key_here
GOOGLE_TRANSLATE_API_KEY=your_key_here
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Крок 5: Ініціалізація бази даних

1. Після першого deploy відкрийте Railway Terminal
2. Виконайте команду:
```bash
npm run db:push
```

## Крок 6: Налаштування домену

1. В Railway перейдіть до Settings
2. В розділі Domains додайте ваш домен web-service.studio
3. Налаштуйте DNS записи у вашого провайдера:
   - CNAME: www → ваш-проект.railway.app
   - A: @ → IP від Railway (буде показаний)

## Переваги Railway:

- Автоматичні деплої при push в GitHub
- Безкоштовна PostgreSQL база даних
- SSL сертифікати включені
- Простий моніторинг та логи
- $5/міс за додаток

## Наступні кроки після деплою:

1. Перевірте роботу сайту за Railway URL
2. Увійдіть в адмін панель (admin/admin123)
3. Змініть пароль адміністратора
4. Налаштуйте контент через CMS панель

Проект буде автоматично оновлюватися при кожному push в GitHub репозиторій.

## Вирішення типових проблем:

### Помилка "npm run build" не знайдено:
- Перевірте, що в repository є файл `package.json`
- Dockerfile оновлено для правильної роботи з проектом

### Помилка з базою даних:
1. Перевірте що PostgreSQL сервіс додано в Railway
2. Змінна DATABASE_URL повинна автоматично з'явитися
3. Виконайте `npm run db:push` через Railway terminal

### Проблеми з доменом:
- DNS зміни можуть зайняти до 24 годин
- Перевірте правильність CNAME записів
- Railway автоматично видає SSL сертифікат

### Логи та діагностика:
- Переглядайте логи в розділі Deploy Logs Railway
- Використовуйте endpoint `/api/health` для перевірки статусу

Якщо виникають проблеми, скористайтеся кнопкою "Get Help" в Railway або зверніться до документації на railway.app/docs