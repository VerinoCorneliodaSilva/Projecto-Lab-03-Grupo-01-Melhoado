CREATE DATABASE IF NOT EXISTS cryptonova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cryptonova;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, password, avatar, role, created_at, updated_at) VALUES
('Admin CryptoNova', 'admin@cryptonova.com', '$2y$10$tmePI3Ro8xobzRkh.kIaF.hJnN5Y4ZX/UMQcBFttd0cF67ZcVfjFC', 'https://ui-avatars.com/api/?name=Admin+CryptoNova', 'admin', NOW(), NOW()),
('Usuario Demo', 'demo@cryptonova.com', '$2y$10$MpwNV4ZzMJea1D.eC/RXa.PDdVcxG7wWkd70MnkAgtq54pUiRvV/u', 'https://ui-avatars.com/api/?name=Usuario+Demo', 'user', NOW(), NOW());
