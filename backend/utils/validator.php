<?php

declare(strict_types=1);

/**
 * Utilitários de validação e sanitização de entrada.
 */
function sanitizeString(mixed $value): string
{
    return trim(strip_tags((string) $value));
}

function sanitizeEmail(mixed $value): string
{
    return strtolower(trim((string) $value));
}

function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateStrongPassword(string $password): bool
{
    return (bool) preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/', $password);
}
