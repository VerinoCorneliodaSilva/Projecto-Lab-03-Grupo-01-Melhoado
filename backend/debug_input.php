<?php
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'raw' => file_get_contents('php://input'),
    'decoded' => json_decode((string) file_get_contents('php://input'), true),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
