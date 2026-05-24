<?php

declare(strict_types=1);

/**
 * Agrupa as rotas públicas de autenticação.
 */
class AuthRoutes
{
    public static function handle(string $route, PDO $pdo): void
    {
        $controller = new AuthController($pdo);

        switch ($route) {
            case 'auth/register':
                $controller->register();
                break;

            case 'auth/login':
                $controller->login();
                break;

            case 'auth/validate':
                $controller->validate();
                break;

            case 'auth/logout':
                $controller->logout();
                break;

            default:
                jsonResponse(false, 'Rota não encontrada', 404, [], 'Rota não encontrada');
                break;
        }
    }
}
