<?php
// Тестовий файл для перевірки webhook
echo "<h2>Webhook Test</h2>";

// Показати метод запиту
echo "<p>HTTP Method: " . $_SERVER['REQUEST_METHOD'] . "</p>";

// Показати заголовки
echo "<h3>Headers:</h3>";
foreach (getallheaders() as $name => $value) {
    echo "<p>$name: $value</p>";
}

// Показати POST дані
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h3>POST Data:</h3>";
    echo "<pre>" . file_get_contents('php://input') . "</pre>";
} else {
    echo "<p>Для тестування webhook використовуйте POST запит</p>";
}

// Перевірити права доступу
echo "<h3>File Permissions:</h3>";
echo "<p>Current directory: " . __DIR__ . "</p>";
echo "<p>Writable: " . (is_writable(__DIR__) ? 'Yes' : 'No') . "</p>";

// Перевірити наявність Git
$git_check = shell_exec('which git 2>&1');
echo "<p>Git available: " . ($git_check ? 'Yes' : 'No') . "</p>";
if ($git_check) {
    echo "<p>Git path: " . trim($git_check) . "</p>";
}
?>