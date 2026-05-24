<?php

declare(strict_types=1);

/**
 * Middleware para validação de JWT e acesso às rotas protegidas.
 */
class AuthMiddleware
{
    public static function authenticate(): array
    {
        $token = extractBearerToken($_SERVER['HTTP_AUTHORIZATION'] ?? '');

        if ($token === null) {
            jsonResponse(false, 'Token ausente', 401, [], 'Token ausente');
        }

        $payload = validateJwt($token);

        if ($payload === null) {
            jsonResponse(false, 'Token inválido', 401, [], 'Token inválido');
        }

        return $payload;
    }
}
