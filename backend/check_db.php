<?php

declare(strict_types=1);

require_once __DIR__ . '/config/database.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $pdo = getDatabaseConnection();

    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    $database = $pdo->query('SELECT DATABASE()')->fetchColumn();

    echo "Conexão com o banco de dados bem-sucedida.\n";
    echo "Banco: {$database}\n";
    echo "Versão do MySQL: {$version}\n";
} catch (Throwable $e) {
    http_response_code(500);

    echo "Falha ao conectar ao banco de dados.\n";
    echo "Erro: " . $e->getMessage() . "\n";
    exit(1);
}
