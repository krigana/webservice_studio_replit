<?php
// GitHub Webhook Handler for Auto-Deployment
// Цей файл обробляє webhook запити від GitHub та автоматично оновлює сайт

// Налаштування
$secret = 'MyWebsite2024SecureKey!@#'; // Ваш секретний ключ
$repo_path = '/home/u11749189/domains/web-service.studio/public_html'; // Правильний шлях
$github_repo = 'https://github.com/KryhanAndrii/webservice_studio_replit.git';

// Логування
function writeLog($message) {
    $log = date('Y-m-d H:i:s') . " - " . $message . "\n";
    file_put_contents('webhook.log', $log, FILE_APPEND | LOCK_EX);
}

// Перевірка HTTP методу
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    writeLog('Error: Only POST method allowed');
    exit('Method not allowed');
}

// Отримання даних
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Перевірка підпису (якщо встановлено секрет)
if (!empty($secret)) {
    $expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($expected_signature, $signature)) {
        http_response_code(403);
        writeLog('Error: Invalid signature');
        exit('Invalid signature');
    }
}

// Декодування JSON
$data = json_decode($payload, true);
if (!$data) {
    http_response_code(400);
    writeLog('Error: Invalid JSON payload');
    exit('Invalid JSON');
}

// Перевірка події push до main/master гілки
if (!isset($data['ref']) || !in_array($data['ref'], ['refs/heads/main', 'refs/heads/master'])) {
    writeLog('Info: Not a push to main/master branch, ignoring');
    exit('Not main branch');
}

writeLog('Info: Received valid webhook for ' . $data['ref']);

// Виконання розгортання
try {
    // Змінити робочу директорію
    chdir($repo_path);
    
    // Команди для оновлення
    $commands = [
        'git fetch origin',
        'git reset --hard origin/main',
        'git clean -fd'
    ];
    
    foreach ($commands as $command) {
        $output = [];
        $return_code = 0;
        
        exec($command . ' 2>&1', $output, $return_code);
        
        if ($return_code !== 0) {
            throw new Exception("Command failed: $command\nOutput: " . implode("\n", $output));
        }
        
        writeLog("Success: $command");
    }
    
    // Якщо є статичні файли для копіювання
    if (file_exists('static-deploy/index.html')) {
        exec('cp -r static-deploy/* ./ 2>&1', $output, $return_code);
        if ($return_code === 0) {
            writeLog('Success: Copied static files');
        } else {
            writeLog('Warning: Failed to copy static files');
        }
    }
    
    writeLog('Success: Deployment completed successfully');
    echo 'Deployment successful';
    
} catch (Exception $e) {
    writeLog('Error: ' . $e->getMessage());
    http_response_code(500);
    echo 'Deployment failed: ' . $e->getMessage();
}
?>