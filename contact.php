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

file_put_contents('contacts.txt', json_encode($data, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

// Отправляем email
$to = 'support@web-service.studio';
$subject = 'Нове повідомлення з сайту web-service.studio';
$body = "Ім'я: $name\nТелефон: $phone\nПовідомлення: $message\n\nДата: " . date('Y-m-d H:i:s');
$headers = "From: noreply@web-service.studio\r\n";
$headers .= "Reply-To: noreply@web-service.studio\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($to, $subject, $body, $headers);

echo json_encode(['success' => true]);
?>