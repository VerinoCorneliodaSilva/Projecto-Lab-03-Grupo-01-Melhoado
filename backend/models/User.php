<?php

declare(strict_types=1);

/**
 * Model para acesso à tabela users.
 */
class User
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO users (username, email, password, avatar, role, created_at, updated_at)
                VALUES (:username, :email, :password, :avatar, :role, NOW(), NOW())';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':username', $data['username']);
        $statement->bindValue(':email', $data['email']);
        $statement->bindValue(':password', $data['password']);
        $statement->bindValue(':avatar', $data['avatar'], $data['avatar'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $statement->bindValue(':role', $data['role']);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function findByEmail(string $email): ?array
    {
        $statement = $this->pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $statement->bindValue(':email', $email);
        $statement->execute();

        $user = $statement->fetch();

        return is_array($user) ? $user : null;
    }

    public function findById(int $id): ?array
    {
        $statement = $this->pdo->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();

        $user = $statement->fetch();

        return is_array($user) ? $user : null;
    }
}
