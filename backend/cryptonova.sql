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

CREATE TABLE IF NOT EXISTS user_wallets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    available_balance DECIMAL(18, 2) NOT NULL DEFAULT 10000.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_wallets_user_id (user_id),
    CONSTRAINT fk_user_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_holdings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    crypto_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
    avg_buy_price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_invested DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_holdings_user_crypto (user_id, crypto_id),
    CONSTRAINT fk_user_holdings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trade_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    crypto_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    fee DECIMAL(18, 2) NOT NULL,
    total DECIMAL(18, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trade_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    crypto_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    avg_buy_price DECIMAL(18, 2) NOT NULL,
    total_invested DECIMAL(18, 2) NOT NULL,
    current_value DECIMAL(18, 2) NOT NULL,
    snapshot_type ENUM('buy', 'sell') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_snapshots_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, password, avatar, role, created_at, updated_at) VALUES
('Admin CryptoNova', 'admin@cryptonova.com', '$2y$10$tmePI3Ro8xobzRkh.kIaF.hJnN5Y4ZX/UMQcBFttd0cF67ZcVfjFC', 'https://ui-avatars.com/api/?name=Admin+CryptoNova', 'admin', NOW(), NOW()),
('Usuario Demo', 'demo@cryptonova.com', '$2y$10$MpwNV4ZzMJea1D.eC/RXa.PDdVcxG7wWkd70MnkAgtq54pUiRvV/u', 'https://ui-avatars.com/api/?name=Usuario+Demo', 'user', NOW(), NOW());

INSERT INTO user_wallets (user_id, available_balance, created_at, updated_at)
SELECT id, 10000.00, NOW(), NOW()
FROM users
WHERE id NOT IN (SELECT user_id FROM user_wallets);
