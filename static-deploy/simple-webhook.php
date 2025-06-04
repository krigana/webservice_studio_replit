<?php
// Спрощений GitHub Webhook для хостингів без Git
// Завантажує та розпаковує останню версію з GitHub

$secret = 'your_webhook_secret_here'; // Замініть на ваш секрет
$github_repo = 'KryhanAndrii/webservice_studio_replit';

function writeLog($message) {
    file_put_contents('deploy.log', date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Перевірка підпису
if (!empty($secret)) {
    $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($expected, $signature)) {
        http_response_code(403);
        writeLog('Invalid signature');
        exit('Forbidden');
    }
}

$data = json_decode($payload, true);
if (!$data || !isset($data['ref'])) {
    writeLog('Invalid payload');
    exit('Invalid payload');
}

// Перевірка гілки
if (!in_array($data['ref'], ['refs/heads/main', 'refs/heads/master'])) {
    writeLog('Not main branch, skipping');
    exit('Not main branch');
}

try {
    writeLog('Starting deployment...');
    
    // Завантаження ZIP архіву
    $zip_url = "https://github.com/{$github_repo}/archive/refs/heads/main.zip";
    $zip_content = file_get_contents($zip_url);
    
    if ($zip_content === false) {
        throw new Exception('Failed to download repository');
    }
    
    $zip_file = 'temp_deploy.zip';
    file_put_contents($zip_file, $zip_content);
    
    // Створення тимчасової папки
    $temp_dir = 'temp_extract';
    if (is_dir($temp_dir)) {
        exec("rm -rf $temp_dir");
    }
    mkdir($temp_dir);
    
    // Розпакування
    $zip = new ZipArchive;
    if ($zip->open($zip_file) === TRUE) {
        $zip->extractTo($temp_dir);
        $zip->close();
        
        // Знаходження папки з файлами
        $extracted_dirs = glob($temp_dir . '/*', GLOB_ONLYDIR);
        if (empty($extracted_dirs)) {
            throw new Exception('No extracted directory found');
        }
        
        $source_dir = $extracted_dirs[0] . '/static-deploy';
        
        // Копіювання файлів
        if (is_dir($source_dir)) {
            exec("cp -r $source_dir/* ./", $output, $return_code);
            if ($return_code !== 0) {
                throw new Exception('Failed to copy files');
            }
        } else {
            // Якщо немає static-deploy, копіюємо основні файли
            $files_to_copy = ['index.html', 'contact.php', '.htaccess'];
            foreach ($files_to_copy as $file) {
                $source_file = $extracted_dirs[0] . '/' . $file;
                if (file_exists($source_file)) {
                    copy($source_file, './' . $file);
                }
            }
        }
        
        writeLog('Files copied successfully');
        
    } else {
        throw new Exception('Failed to extract ZIP file');
    }
    
    // Очищення тимчасових файлів
    unlink($zip_file);
    exec("rm -rf $temp_dir");
    
    writeLog('Deployment completed successfully');
    echo 'Deployment successful';
    
} catch (Exception $e) {
    writeLog('Error: ' . $e->getMessage());
    http_response_code(500);
    echo 'Deployment failed: ' . $e->getMessage();
}
?>