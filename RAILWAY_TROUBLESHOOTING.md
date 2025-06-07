# Вирішення проблем з Railway Deployment

## Проблема: Healthcheck Failure

### Причина:
Railway не може підключитися до додатку через відсутність бази даних PostgreSQL.

### Рішення:

1. **Додайте PostgreSQL першим кроком:**
   - В Railway проекті: Add Service → Database → PostgreSQL
   - Дочекайтесь створення бази даних
   - Перевірте що з'явилась змінна DATABASE_URL

2. **Оновіть файли проекту з GitHub:**
   - Завантажте оновлений проект з Replit
   - Замініть файли в GitHub репозиторії
   - Головні файли: Dockerfile, railway.json, server/index.ts

3. **Налаштуйте змінні середовища:**
```
NODE_ENV=production
DATABASE_URL=postgresql://... (автоматично)
GOOGLE_MAPS_API_KEY=ваш_ключ
GOOGLE_TRANSLATE_API_KEY=ваш_ключ
PAYPAL_CLIENT_ID=ваш_id
PAYPAL_CLIENT_SECRET=ваш_секрет
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=ваш_id
```

4. **Повторний deploy:**
   - Railway автоматично перезапустить deploy
   - Або натисніть "Redeploy" вручну

5. **Ініціалізація бази даних:**
   - Відкрийте Railway Terminal
   - Виконайте: `npm run db:push`

## Ключові зміни в файлах:

### Dockerfile:
- Виправлено обробку залежностей
- Додано підтримку PORT змінної
- Тимчасова DATABASE_URL для збірки

### server/index.ts:
- Додано health endpoints: `/health` та `/api/health`
- Використання PORT змінної Railway
- Покращена обробка помилок

### railway.json:
- Використання Dockerfile builder
- Health check на `/health` endpoint
- Збільшений timeout

## Перевірка роботи:

1. **Build Logs:** повинен бути успішний
2. **Deploy Logs:** без помилок
3. **Health Check:** статус OK
4. **Відкрийте URL:** сайт повинен працювати

## Якщо проблема залишається:

1. Перевірте Deploy Logs в Railway
2. Переконайтесь що PostgreSQL запущений
3. Перевірте Variables - DATABASE_URL присутня
4. Спробуйте Redeploy проекту

Після виконання цих кроків проект повинен успішно працювати на Railway.