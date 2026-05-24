<?php

declare(strict_types=1);

require_once __DIR__ . '/utils/response.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/validator.php';
require_once __DIR__ . '/utils/jwt.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/routes/auth.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$route = trim((string) ($_GET['route'] ?? ''));

if ($route === '') {
    jsonResponse(false, 'Rota não encontrada', 404, [], 'Rota não encontrada');
}

try {
    $pdo = getDatabaseConnection();
    AuthRoutes::handle($route, $pdo);
} catch (Throwable $exception) {
    jsonResponse(false, 'Erro interno do servidor', 500, [], 'Erro interno do servidor');
}
