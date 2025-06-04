# Налаштування GitHub Webhook для автоматичного розгортання

## Крок 1: Підготовка на сервері Hostinger

1. **Завантажте webhook.php** у корінь вашого сайту (public_html)
2. **Встановіть права доступу**: `chmod 755 webhook.php`
3. **Відредагуйте налаштування** у webhook.php:
   ```php
   $secret = 'ваш_секретний_ключ_тут';
   $repo_path = '/home/ваш_username/public_html';
   ```

## Крок 2: Налаштування Git на сервері

1. **Клонуйте репозиторій** у public_html:
   ```bash
   cd /home/ваш_username/public_html
   git clone https://github.com/KryhanAndrii/webservice_studio_replit.git .
   ```

2. **Налаштуйте Git credentials** (якщо потрібно):
   ```bash
   git config --global user.name "Ваше Ім'я"
   git config --global user.email "ваш@email.com"
   ```

## Крок 3: Створення webhook на GitHub

1. **Відкрийте ваш репозиторій** на GitHub
2. **Перейдіть до Settings** → **Webhooks**
3. **Натисніть "Add webhook"**
4. **Заповніть форму**:
   - **Payload URL**: `https://web-service.studio/webhook.php`
   - **Content type**: `application/json`
   - **Secret**: той самий ключ що в webhook.php
   - **Events**: оберіть "Just the push event"
   - **Active**: ✅

## Крок 4: Тестування

1. **Зробіть push** до репозиторію
2. **Перевірте логи**: `https://web-service.studio/webhook.log`
3. **Перевірте оновлення** на сайті

## Налаштування безпеки

**У .htaccess додайте**:
```apache
# Захист webhook.log від публічного доступу
<Files "webhook.log">
    Order Allow,Deny
    Deny from all
</Files>

# Захист .git папки
RedirectMatch 404 /\.git
```

## Альтернативний варіант для спрощення

Якщо Git недоступний на хостингу, webhook може просто завантажувати ZIP архів:

```php
// Завантаження останньої версії
$zip_url = 'https://github.com/KryhanAndrii/webservice_studio_replit/archive/refs/heads/main.zip';
$zip_file = 'latest.zip';

file_put_contents($zip_file, file_get_contents($zip_url));
// Розархівувати та перемістити файли
```

## Перевірка роботи

- Webhook URL повинен відповідати 200 OK
- Логи webhook.log показують успішні операції
- Зміни в репозиторії автоматично з'являються на сайті