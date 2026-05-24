<?php

declare(strict_types=1);

/**
 * Resposta JSON padronizada para toda a API PHP.
 */
function jsonResponse(
    bool $success,
    string $message = '',
    int $status = 200,
    array $data = [],
    ?string $error = null
): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    http_response_code($status);

    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'error' => $error,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    exit;
}
