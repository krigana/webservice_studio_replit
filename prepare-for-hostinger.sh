#!/bin/bash

echo "🚀 Подготовка проекта для развертывания на хостинге..."

# Создаем папку для развертывания
mkdir -p hostinger-deploy

# Собираем фронтенд
echo "📦 Сборка фронтенда..."
npm run build

# Копируем собранные файлы
cp -r dist/* hostinger-deploy/

# Создаем .htaccess для корректной работы SPA
cat > hostinger-deploy/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle Angular and React routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF

# Создаем PHP файл для контактной формы
cat > hostinger-deploy/contact.php << 'EOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$name = htmlspecialchars($input['name'] ?? '');
$phone = htmlspecialchars($input['phone'] ?? '');
$message = htmlspecialchars($input['message'] ?? '');

if (empty($name) || empty($phone) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

// Сохраняем в файл
$data = [
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => $name,
    'phone' => $phone,
    'message' => $message
];

file_put_contents('contacts.txt', json_encode($data) . "\n", FILE_APPEND | LOCK_EX);

// Отправляем email (настройте под ваш хостинг)
$to = 'support@web-service.studio';
$subject = 'Новое сообщение с сайта';
$body = "Имя: $name\nТелефон: $phone\nСообщение: $message";
$headers = 'From: noreply@web-service.studio';

mail($to, $subject, $body, $headers);

echo json_encode(['success' => true]);
?>
EOF

echo "✅ Проект подготовлен для развертывания!"
echo "📁 Файлы находятся в папке: hostinger-deploy/"
echo "📤 Загрузите содержимое этой папки в public_html на хостинге"

# Создаем ZIP архив
cd hostinger-deploy
zip -r ../hostinger-deploy.zip .
cd ..

echo "📦 Создан архив: hostinger-deploy.zip"
echo "🌐 После загрузки сайт будет доступен по адресу: web-service.studio"