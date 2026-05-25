<?php

declare(strict_types=1);

/**
 * Controller responsável pelas operações de trading do usuário.
 */
class TradeController
{
    private PDO $pdo;
    private User $userModel;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->userModel = new User($pdo);
    }

    public function buy(): void
    {
        $payload = AuthMiddleware::authenticate();
        $user = $this->userModel->findById((int) $payload['sub']);

        if ($user === null) {
            jsonResponse(false, 'Usuário não encontrado', 404, [], 'Usuário não encontrado');
        }

        $body = $this->getJsonInput();
        $cryptoId = sanitizeString($body['cryptoId'] ?? '');
        $symbol = strtoupper(sanitizeString($body['symbol'] ?? ''));
        $amount = (float) ($body['amount'] ?? 0);
        $price = (float) ($body['price'] ?? 0);

        if ($cryptoId === '' || $symbol === '' || $amount <= 0 || $price <= 0) {
            jsonResponse(false, 'Dados inválidos', 422, [], 'Dados inválidos');
        }

        $subtotal = round($amount * $price, 2);
        $fee = round($subtotal * 0.001, 2);
        $total = round($subtotal + $fee, 2);

        $currentBalance = $this->userModel->getWalletBalance((int) $user['id']);

        if ($currentBalance < $total) {
            jsonResponse(false, 'Saldo insuficiente', 422, [], 'Saldo insuficiente');
        }

        $this->pdo->beginTransaction();

        $transactionId = 0;

        try {
            $this->userModel->updateWalletBalance((int) $user['id'], -$total);
            $this->userModel->upsertHolding((int) $user['id'], $cryptoId, $symbol, $amount, $price, $total);
            $transactionId = $this->userModel->createTradeTransaction((int) $user['id'], 'buy', $cryptoId, $symbol, $amount, $price, $fee, $total);

            $holding = $this->findHolding((int) $user['id'], $cryptoId);
            if ($holding !== null) {
                $this->userModel->createPortfolioSnapshot(
                    (int) $user['id'],
                    $cryptoId,
                    $symbol,
                    (float) $holding['amount'],
                    (float) $holding['avg_buy_price'],
                    (float) $holding['total_invested'],
                    round((float) $holding['amount'] * $price, 2),
                    'buy'
                );
            }

            $this->pdo->commit();
        } catch (Throwable $exception) {
            $this->pdo->rollBack();
            throw $exception;
        }

        $holding = $this->findHolding((int) $user['id'], $cryptoId);
        $updatedBalance = $this->userModel->getWalletBalance((int) $user['id']);

        jsonResponse(true, 'Compra realizada com sucesso', 200, [
            'transaction' => [
                'id' => $transactionId,
                'userId' => (int) $user['id'],
                'type' => 'buy',
                'cryptoId' => $cryptoId,
                'symbol' => $symbol,
                'amount' => round($amount, 8),
                'price' => round($price, 2),
                'fee' => round($fee, 2),
                'total' => round($total, 2),
                'timestamp' => (new DateTimeImmutable('now'))->format(DATE_ATOM),
            ],
            'holding' => $holding,
            'wallet' => [
                'availableBalance' => round($updatedBalance, 2),
            ],
        ]);
    }

    public function sell(): void
    {
        $payload = AuthMiddleware::authenticate();
        $user = $this->userModel->findById((int) $payload['sub']);

        if ($user === null) {
            jsonResponse(false, 'Usuário não encontrado', 404, [], 'Usuário não encontrado');
        }

        $body = $this->getJsonInput();
        $cryptoId = sanitizeString($body['cryptoId'] ?? '');
        $symbol = strtoupper(sanitizeString($body['symbol'] ?? ''));
        $amount = (float) ($body['amount'] ?? 0);
        $price = (float) ($body['price'] ?? 0);

        if ($cryptoId === '' || $symbol === '' || $amount <= 0 || $price <= 0) {
            jsonResponse(false, 'Dados inválidos', 422, [], 'Dados inválidos');
        }

        $holding = $this->findHolding((int) $user['id'], $cryptoId);

        if ($holding === null || (float) $holding['amount'] < $amount) {
            jsonResponse(false, 'Quantidade insuficiente', 422, [], 'Quantidade insuficiente');
        }

        $subtotal = round($amount * $price, 2);
        $fee = round($subtotal * 0.001, 2);
        $total = round($subtotal - $fee, 2);

        $transactionId = 0;

        $this->pdo->beginTransaction();

        try {
            $this->userModel->reduceHolding((int) $user['id'], $cryptoId, $amount);
            $this->userModel->updateWalletBalance((int) $user['id'], $total);
            $transactionId = $this->userModel->createTradeTransaction((int) $user['id'], 'sell', $cryptoId, $symbol, $amount, $price, $fee, $total);

            $updatedHolding = $this->findHolding((int) $user['id'], $cryptoId);
            $snapshotAmount = $updatedHolding !== null ? (float) $updatedHolding['amount'] : 0.0;
            $snapshotAvgPrice = $updatedHolding !== null ? (float) $updatedHolding['avg_buy_price'] : 0.0;
            $snapshotTotalInvested = $updatedHolding !== null ? (float) $updatedHolding['total_invested'] : 0.0;

            $this->userModel->createPortfolioSnapshot(
                (int) $user['id'],
                $cryptoId,
                $symbol,
                $snapshotAmount,
                $snapshotAvgPrice,
                $snapshotTotalInvested,
                round($snapshotAmount * $price, 2),
                'sell'
            );

            $this->pdo->commit();
        } catch (Throwable $exception) {
            $this->pdo->rollBack();
            throw $exception;
        }

        $updatedBalance = $this->userModel->getWalletBalance((int) $user['id']);
        $updatedHolding = $this->findHolding((int) $user['id'], $cryptoId);

        jsonResponse(true, 'Venda realizada com sucesso', 200, [
            'transaction' => [
                'id' => $transactionId,
                'userId' => (int) $user['id'],
                'type' => 'sell',
                'cryptoId' => $cryptoId,
                'symbol' => $symbol,
                'amount' => round($amount, 8),
                'price' => round($price, 2),
                'fee' => round($fee, 2),
                'total' => round($total, 2),
                'timestamp' => (new DateTimeImmutable('now'))->format(DATE_ATOM),
            ],
            'holding' => $updatedHolding,
            'wallet' => [
                'availableBalance' => round($updatedBalance, 2),
            ],
        ]);
    }

    public function getHoldings(): void
    {
        $payload = AuthMiddleware::authenticate();
        $user = $this->userModel->findById((int) $payload['sub']);

        if ($user === null) {
            jsonResponse(false, 'Usuário não encontrado', 404, [], 'Usuário não encontrado');
        }

        $holdings = $this->userModel->getHoldings((int) $user['id']);

        jsonResponse(true, 'Holdings carregadas', 200, [
            'holdings' => array_map([$this, 'normalizeHolding'], $holdings),
        ]);
    }

    public function getTransactions(): void
    {
        $payload = AuthMiddleware::authenticate();
        $user = $this->userModel->findById((int) $payload['sub']);

        if ($user === null) {
            jsonResponse(false, 'Usuário não encontrado', 404, [], 'Usuário não encontrado');
        }

        $transactions = $this->userModel->getTransactions((int) $user['id']);

        jsonResponse(true, 'Transações carregadas', 200, [
            'transactions' => array_map([$this, 'normalizeTransaction'], $transactions),
        ]);
    }

    public function getSnapshots(): void
    {
        $payload = AuthMiddleware::authenticate();
        $user = $this->userModel->findById((int) $payload['sub']);

        if ($user === null) {
            jsonResponse(false, 'Usuário não encontrado', 404, [], 'Usuário não encontrado');
        }

        $snapshots = $this->userModel->getPortfolioSnapshots((int) $user['id']);

        jsonResponse(true, 'Snapshots carregados', 200, [
            'snapshots' => array_map([$this, 'normalizeSnapshot'], $snapshots),
        ]);
    }

    private function getJsonInput(): array
    {
        $rawBody = file_get_contents('php://input');
        $decoded = json_decode((string) $rawBody, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function findHolding(int $userId, string $cryptoId): ?array
    {
        $holdings = $this->userModel->getHoldings($userId);

        foreach ($holdings as $holding) {
            if (is_array($holding) && isset($holding['crypto_id']) && (string) $holding['crypto_id'] === $cryptoId) {
                return $holding;
            }
        }

        return null;
    }

    private function normalizeHolding(array $holding): array
    {
        return [
            'id' => (int) $holding['id'],
            'userId' => (int) $holding['user_id'],
            'cryptoId' => (string) $holding['crypto_id'],
            'symbol' => (string) $holding['symbol'],
            'amount' => (float) $holding['amount'],
            'avgBuyPrice' => (float) $holding['avg_buy_price'],
            'totalInvested' => (float) $holding['total_invested'],
            'updatedAt' => (string) $holding['updated_at'],
        ];
    }

    private function normalizeTransaction(array $transaction): array
    {
        return [
            'id' => (int) $transaction['id'],
            'userId' => (int) $transaction['user_id'],
            'type' => (string) $transaction['type'],
            'cryptoId' => (string) $transaction['crypto_id'],
            'symbol' => (string) $transaction['symbol'],
            'amount' => (float) $transaction['amount'],
            'price' => (float) $transaction['price'],
            'fee' => (float) $transaction['fee'],
            'total' => (float) $transaction['total'],
            'timestamp' => (string) $transaction['created_at'],
        ];
    }

    private function normalizeSnapshot(array $snapshot): array
    {
        return [
            'id' => (int) $snapshot['id'],
            'userId' => (int) $snapshot['user_id'],
            'cryptoId' => (string) $snapshot['crypto_id'],
            'symbol' => (string) $snapshot['symbol'],
            'amount' => (float) $snapshot['amount'],
            'avgBuyPrice' => (float) $snapshot['avg_buy_price'],
            'totalInvested' => (float) $snapshot['total_invested'],
            'currentValue' => (float) $snapshot['current_value'],
            'snapshotType' => (string) $snapshot['snapshot_type'],
            'createdAt' => (string) $snapshot['created_at'],
        ];
    }
}
