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

    public function createWallet(int $userId, float $initialBalance = 10000.0): void
    {
        $statement = $this->pdo->prepare('INSERT INTO user_wallets (user_id, available_balance, created_at, updated_at)
            VALUES (:user_id, :available_balance, NOW(), NOW())');

        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':available_balance', number_format($initialBalance, 2, '.', ''), PDO::PARAM_STR);
        $statement->execute();
    }

    public function updatePassword(int $userId, string $passwordHash): void
    {
        $statement = $this->pdo->prepare('UPDATE users
            SET password = :password, updated_at = NOW()
            WHERE id = :id');

        $statement->bindValue(':password', $passwordHash);
        $statement->bindValue(':id', $userId, PDO::PARAM_INT);
        $statement->execute();
    }

    public function getWalletBalance(int $userId): float
    {
        $statement = $this->pdo->prepare('SELECT available_balance FROM user_wallets WHERE user_id = :user_id LIMIT 1');
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        $wallet = $statement->fetch();

        return $wallet !== false && is_array($wallet) && isset($wallet['available_balance'])
            ? (float) $wallet['available_balance']
            : 0.0;
    }

    public function updateWalletBalance(int $userId, float $delta): void
    {
        $statement = $this->pdo->prepare('UPDATE user_wallets
            SET available_balance = ROUND(available_balance + :delta, 2), updated_at = NOW()
            WHERE user_id = :user_id');

        $statement->bindValue(':delta', number_format($delta, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();
    }

    public function upsertHolding(int $userId, string $cryptoId, string $symbol, float $amount, float $price, float $total): void
    {
        $statement = $this->pdo->prepare('INSERT INTO user_holdings (user_id, crypto_id, symbol, amount, avg_buy_price, total_invested, updated_at)
            VALUES (:user_id, :crypto_id, :symbol, :amount, :avg_buy_price, :total_invested, NOW())
            ON DUPLICATE KEY UPDATE
                amount = amount + VALUES(amount),
                avg_buy_price = ((avg_buy_price * amount) + (VALUES(avg_buy_price) * VALUES(amount))) / (amount + VALUES(amount)),
                total_invested = total_invested + VALUES(total_invested),
                updated_at = NOW()');

        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':crypto_id', $cryptoId);
        $statement->bindValue(':symbol', $symbol);
        $statement->bindValue(':amount', number_format($amount, 8, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':avg_buy_price', number_format($price, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':total_invested', number_format($total, 2, '.', ''), PDO::PARAM_STR);
        $statement->execute();
    }

    public function reduceHolding(int $userId, string $cryptoId, float $amount): ?array
    {
        $statement = $this->pdo->prepare('SELECT id, amount, avg_buy_price, total_invested
            FROM user_holdings
            WHERE user_id = :user_id AND crypto_id = :crypto_id
            LIMIT 1');
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':crypto_id', $cryptoId);
        $statement->execute();

        $holding = $statement->fetch();

        if ($holding === false || !is_array($holding)) {
            return null;
        }

        $newAmount = (float) $holding['amount'] - $amount;

        if ($newAmount <= 0.00000001) {
            $delete = $this->pdo->prepare('DELETE FROM user_holdings WHERE id = :id');
            $delete->bindValue(':id', (int) $holding['id'], PDO::PARAM_INT);
            $delete->execute();

            return ['delete' => true, 'amount' => 0.0, 'avg_buy_price' => 0.0, 'total_invested' => 0.0];
        }

        $newTotalInvested = (float) $holding['avg_buy_price'] * $newAmount;
        $update = $this->pdo->prepare('UPDATE user_holdings
            SET amount = :amount, avg_buy_price = :avg_buy_price, total_invested = :total_invested, updated_at = NOW()
            WHERE id = :id');
        $update->bindValue(':amount', number_format($newAmount, 8, '.', ''), PDO::PARAM_STR);
        $update->bindValue(':avg_buy_price', number_format((float) $holding['avg_buy_price'], 2, '.', ''), PDO::PARAM_STR);
        $update->bindValue(':total_invested', number_format($newTotalInvested, 2, '.', ''), PDO::PARAM_STR);
        $update->bindValue(':id', (int) $holding['id'], PDO::PARAM_INT);
        $update->execute();

        return [
            'delete' => false,
            'amount' => $newAmount,
            'avg_buy_price' => (float) $holding['avg_buy_price'],
            'total_invested' => $newTotalInvested,
        ];
    }

    public function createTradeTransaction(int $userId, string $type, string $cryptoId, string $symbol, float $amount, float $price, float $fee, float $total): int
    {
        $statement = $this->pdo->prepare('INSERT INTO trade_transactions (user_id, type, crypto_id, symbol, amount, price, fee, total, created_at)
            VALUES (:user_id, :type, :crypto_id, :symbol, :amount, :price, :fee, :total, NOW())');

        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':type', $type);
        $statement->bindValue(':crypto_id', $cryptoId);
        $statement->bindValue(':symbol', $symbol);
        $statement->bindValue(':amount', number_format($amount, 8, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':price', number_format($price, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':fee', number_format($fee, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':total', number_format($total, 2, '.', ''), PDO::PARAM_STR);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function createPortfolioSnapshot(int $userId, string $cryptoId, string $symbol, float $amount, float $avgBuyPrice, float $totalInvested, float $currentValue, string $snapshotType): void
    {
        $statement = $this->pdo->prepare('INSERT INTO portfolio_snapshots (user_id, crypto_id, symbol, amount, avg_buy_price, total_invested, current_value, snapshot_type, created_at)
            VALUES (:user_id, :crypto_id, :symbol, :amount, :avg_buy_price, :total_invested, :current_value, :snapshot_type, NOW())');

        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':crypto_id', $cryptoId);
        $statement->bindValue(':symbol', $symbol);
        $statement->bindValue(':amount', number_format($amount, 8, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':avg_buy_price', number_format($avgBuyPrice, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':total_invested', number_format($totalInvested, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':current_value', number_format($currentValue, 2, '.', ''), PDO::PARAM_STR);
        $statement->bindValue(':snapshot_type', $snapshotType);
        $statement->execute();
    }

    public function getHoldings(int $userId): array
    {
        $statement = $this->pdo->prepare('SELECT id, user_id, crypto_id, symbol, amount, avg_buy_price, total_invested, updated_at
            FROM user_holdings
            WHERE user_id = :user_id
            ORDER BY updated_at DESC');
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function getTransactions(int $userId): array
    {
        $statement = $this->pdo->prepare('SELECT id, user_id, type, crypto_id, symbol, amount, price, fee, total, created_at
            FROM trade_transactions
            WHERE user_id = :user_id
            ORDER BY created_at DESC');
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function getPortfolioSnapshots(int $userId): array
    {
        $statement = $this->pdo->prepare('SELECT id, user_id, crypto_id, symbol, amount, avg_buy_price, total_invested, current_value, snapshot_type, created_at
            FROM portfolio_snapshots
            WHERE user_id = :user_id
            ORDER BY created_at ASC');
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function findByEmail(string $email): ?array
    {
        $statement = $this->pdo->prepare('SELECT u.*, IFNULL(w.available_balance, 10000.00) AS balance
            FROM users u
            LEFT JOIN user_wallets w ON w.user_id = u.id
            WHERE u.email = :email
            LIMIT 1');
        $statement->bindValue(':email', $email);
        $statement->execute();

        $user = $statement->fetch();

        return is_array($user) ? $user : null;
    }

    public function findById(int $id): ?array
    {
        $statement = $this->pdo->prepare('SELECT u.*, IFNULL(w.available_balance, 10000.00) AS balance
            FROM users u
            LEFT JOIN user_wallets w ON w.user_id = u.id
            WHERE u.id = :id
            LIMIT 1');
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();

        $user = $statement->fetch();

        return is_array($user) ? $user : null;
    }
}
