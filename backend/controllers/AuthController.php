<?php

declare(strict_types=1);

/**
 * Controller responsável pelas rotas públicas de autenticação.
 */
class AuthController
{
    private User $userModel;

    public function __construct(PDO $pdo)
    {
        $this->userModel = new User($pdo);
    }

    public function register(): void
    {
        $payload = $this->getJsonInput();
        $username = sanitizeString($payload['username'] ?? '');
        $email = sanitizeEmail($payload['email'] ?? '');
        $password = (string) ($payload['password'] ?? '');
        $avatar = sanitizeString($payload['avatar'] ?? '');

        $errors = [];

        if (mb_strlen($username) < 2) {
            $errors['username'] = 'O nome deve ter pelo menos 2 caracteres.';
        }

        if (!isValidEmail($email)) {
            $errors['email'] = 'Informe um email válido.';
        }

        if (!validateStrongPassword($password)) {
            $errors['password'] = 'A senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo.';
        }

        if ($this->userModel->findByEmail($email) !== null) {
            $errors['email'] = 'Este email já está cadastrado.';
        }

        if ($errors !== []) {
            jsonResponse(false, 'Dados inválidos', 422, ['errors' => $errors], 'Dados inválidos');
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $avatarValue = $avatar !== '' ? $avatar : null;

        $userId = $this->userModel->create([
            'username' => $username,
            'email' => $email,
            'password' => $passwordHash,
            'avatar' => $avatarValue,
            'role' => 'user',
        ]);

        $this->userModel->createWallet((int) $userId);

        $createdUser = $this->userModel->findById((int) $userId);

        if ($createdUser === null) {
            jsonResponse(false, 'Não foi possível concluir o cadastro', 500, [], 'Erro interno ao salvar usuário');
        }

        $token = generateJwt([
            'sub' => (string) $createdUser['id'],
            'username' => $createdUser['username'],
            'email' => $createdUser['email'],
            'role' => $createdUser['role'],
            'avatar' => $createdUser['avatar'],
        ]);

        jsonResponse(true, 'Cadastro realizado com sucesso', 201, [
            'user' => $this->mapUser($createdUser),
            'token' => $token,
        ]);
    }

    public function login(): void
    {
        $payload = $this->getJsonInput();
        $email = sanitizeEmail($payload['email'] ?? '');
        $password = (string) ($payload['password'] ?? '');

        if (!isValidEmail($email) || $password === '') {
            jsonResponse(false, 'Credenciais inválidas', 401, [], 'Email ou senha incorretos');
        }

        $user = $this->userModel->findByEmail($email);

        if ($user === null || !password_verify($password, $user['password'])) {
            jsonResponse(false, 'Credenciais inválidas', 401, [], 'Email ou senha incorretos');
        }

        $token = generateJwt([
            'sub' => (string) $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar' => $user['avatar'],
        ]);

        jsonResponse(true, 'Login realizado com sucesso', 200, [
            'user' => $this->mapUser($user),
            'token' => $token,
        ]);
    }

    public function validate(): void
    {
        $payload = AuthMiddleware::authenticate();
        $user = $this->userModel->findById((int) $payload['sub']);

        if ($user === null) {
            jsonResponse(false, 'Usuário não encontrado', 404, [], 'Usuário não encontrado');
        }

        jsonResponse(true, 'Token válido', 200, [
            'user' => $this->mapUser($user),
        ]);
    }

    public function logout(): void
    {
        AuthMiddleware::authenticate();

        jsonResponse(true, 'Logout realizado com sucesso', 200, []);
    }

    private function getJsonInput(): array
    {
        $rawBody = file_get_contents('php://input');
        $decoded = json_decode((string) $rawBody, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function mapUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
            'email' => (string) $user['email'],
            'avatar' => $user['avatar'] !== null ? (string) $user['avatar'] : null,
            'role' => (string) $user['role'],
            'balance' => (float) ($user['balance'] ?? 10000.0),
            'createdAt' => (string) $user['created_at'],
            'updatedAt' => (string) $user['updated_at'],
        ];
    }
}
