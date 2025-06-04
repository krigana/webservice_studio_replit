# Посібник розгортання на Хостингер

## Підготовка проекту

### 1. Створення архіву проекту
Створіть архів усіх файлів проекту:
```bash
zip -r webservice-studio.zip . -x "node_modules/*" ".git/*" "dist/*"
```

### 2. Збірка проекту локально (опціонально)
```bash
npm run build
```

## Налаштування на Хостингер

### 1. Створення бази даних PostgreSQL
1. Увійдіть в панель управління Хостингер
2. Перейдіть в розділ "Бази даних" → "PostgreSQL"
3. Створіть нову базу даних
4. Запишіть дані для підключення:
   - Хост
   - Порт
   - Ім'я бази даних
   - Користувач
   - Пароль

### 2. Завантаження файлів
1. Через File Manager або FTP завантажте всі файли проекту
2. Розпакуйте архів в корінь домену

### 3. Налаштування Node.js додатку
1. В панелі управління знайдіть розділ "Node.js"
2. Створіть новий додаток:
   - Entry point: `dist/index.js`
   - Node.js version: 18 або новіша
   - Startup file: `dist/index.js`

### 4. Встановлення залежностей
В терміналі Хостингер виконайте:
```bash
npm install --production
npm run build
```

### 5. Налаштування змінних середовища
Створіть файл `.env` з наступними змінними:

```env
NODE_ENV=production
PORT=3000

# База даних (замініть на ваші дані)
DATABASE_URL=postgresql://username:password@hostname:port/database
PGHOST=your_db_host
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name

# Google APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 6. Ініціалізація бази даних
```bash
npm run db:push
```

### 7. Запуск додатку
```bash
npm start
```

## Налаштування домену

### 1. DNS записи
В налаштуваннях домену додайте:
- A-запис: `@` → IP адреса сервера
- CNAME: `www` → `@`

### 2. SSL сертифікат
Хостингер автоматично видасть SSL сертифікат для домену.

## Важливі API ключі

Вам потрібно отримати наступні API ключі:

### Google Maps API
1. Перейдіть на https://console.cloud.google.com/
2. Створіть новий проект або оберіть існуючий
3. Увімкніть Maps JavaScript API
4. Створіть API ключ
5. Обмежте ключ доменом web-service.studio

### Google Translate API
1. В тому ж проекті Google Cloud
2. Увімкніть Cloud Translation API
3. Створіть API ключ

### PayPal
1. Перейдіть на https://developer.paypal.com/
2. Створіть додаток
3. Отримайте Client ID та Client Secret

### Telegram Bot
1. Знайдіть @BotFather в Telegram
2. Створіть нового бота командою /newbot
3. Отримайте Bot Token
4. Додайте бота в групу та отримайте Chat ID

## Перевірка роботи

1. Відкрийте https://web-service.studio/
2. Перевірте всі розділи сайту
3. Протестуйте форми зворотного зв'язку
4. Увійдіть в адмін панель: https://web-service.studio/admin
5. Логін: admin, Пароль: admin123

## Підтримка

Після розгортання рекомендується:
1. Змінити пароль адміністратора
2. Налаштувати автоматичні бекапи бази даних
3. Налаштувати моніторинг сайту

## Можливі проблеми

### Помилка підключення до бази даних
- Перевірте правильність DATABASE_URL
- Переконайтеся, що база даних доступна

### Статичні файли не завантажуються
- Перевірте, чи збудований проект командою `npm run build`
- Переконайтеся, що папка `dist` містить файли

### API не працюють
- Перевірте правильність API ключів
- Переконайтеся, що домен додано в налаштування API