<?php

declare(strict_types=1);

if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', getenv('CRYPTONOVA_JWT_SECRET') ?: 'cryptonova-dev-secret-change-me');
}

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    $padding = strlen($data) % 4;

    if ($padding > 0) {
        $data .= str_repeat('=', 4 - $padding);
    }

    $decoded = base64_decode($data, true);

    if ($decoded === false) {
        return '';
    }

    return $decoded;
}

function generateJwt(array $payload, int $ttl = 3600): string
{
    $issuedAt = time();
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];

    $claims = array_merge($payload, [
        'iat' => $issuedAt,
        'nbf' => $issuedAt,
        'exp' => $issuedAt + $ttl,
    ]);

    $segments = [
        base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
        base64UrlEncode(json_encode($claims, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
    ];

    $signature = hash_hmac('sha256', implode('.', $segments), JWT_SECRET, true);
    $segments[] = base64UrlEncode($signature);

    return implode('.', $segments);
}

function validateJwt(string $token): ?array
{
    $segments = explode('.', $token);

    if (count($segments) !== 3) {
        return null;
    }

    [$headerSegment, $payloadSegment, $signatureSegment] = $segments;

    $expectedSignature = hash_hmac(
        'sha256',
        $headerSegment . '.' . $payloadSegment,
        JWT_SECRET,
        true
    );

    if (!hash_equals(base64UrlEncode($expectedSignature), $signatureSegment)) {
        return null;
    }

    $payload = json_decode(base64UrlDecode($payloadSegment), true);

    if (!is_array($payload)) {
        return null;
    }

    if (!isset($payload['exp']) || (int) $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

function extractBearerToken(string $authorizationHeader): ?string
{
    if ($authorizationHeader === '') {
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authorizationHeader = (string) ($headers['Authorization'] ?? $headers['authorization'] ?? '');
        } else {
            $authorizationHeader = (string) ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '');
        }
    }

    if (!preg_match('/^Bearer\s+(.+)$/i', $authorizationHeader, $matches)) {
        return null;
    }

    $token = trim($matches[1]);

    return $token === '' ? null : $token;
}
