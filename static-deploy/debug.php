<?php
echo "<h2>Debug Information</h2>";

// Перевірка файлів у директорії
echo "<h3>Files in current directory:</h3>";
$files = scandir('.');
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        $permissions = substr(sprintf('%o', fileperms($file)), -4);
        $size = filesize($file);
        echo "<p>$file - Permissions: $permissions, Size: $size bytes</p>";
    }
}

// Перевірка index.html
echo "<h3>Index.html check:</h3>";
if (file_exists('index.html')) {
    echo "<p>✅ index.html exists</p>";
    echo "<p>Size: " . filesize('index.html') . " bytes</p>";
    echo "<p>Readable: " . (is_readable('index.html') ? 'Yes' : 'No') . "</p>";
    
    // Показати початок файлу
    $content = file_get_contents('index.html');
    echo "<h4>First 500 characters of index.html:</h4>";
    echo "<pre>" . htmlspecialchars(substr($content, 0, 500)) . "</pre>";
} else {
    echo "<p>❌ index.html does not exist</p>";
}

// Перевірка .htaccess
echo "<h3>.htaccess check:</h3>";
if (file_exists('.htaccess')) {
    echo "<p>✅ .htaccess exists</p>";
    echo "<p>Content:</p>";
    echo "<pre>" . htmlspecialchars(file_get_contents('.htaccess')) . "</pre>";
} else {
    echo "<p>❌ .htaccess does not exist</p>";
}

// Перевірка серверних змінних
echo "<h3>Server Information:</h3>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Current Directory: " . getcwd() . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

// Тест створення файлу
echo "<h3>Write permissions test:</h3>";
$test_content = "Test file created at " . date('Y-m-d H:i:s');
if (file_put_contents('test_write.txt', $test_content)) {
    echo "<p>✅ Can write files</p>";
    unlink('test_write.txt');
} else {
    echo "<p>❌ Cannot write files</p>";
}
?>