<?php

declare(strict_types=1);

/**
 * Agrupa as rotas protegidas de trading.
 */
class TradeRoutes
{
    public static function handle(string $route, PDO $pdo): void
    {
        $controller = new TradeController($pdo);

        switch ($route) {
            case 'trade/buy':
                $controller->buy();
                break;

            case 'trade/sell':
                $controller->sell();
                break;

            case 'trade/holdings':
                $controller->getHoldings();
                break;

            case 'trade/transactions':
                $controller->getTransactions();
                break;

            case 'trade/snapshots':
                $controller->getSnapshots();
                break;

            default:
                jsonResponse(false, 'Rota não encontrada', 404, [], 'Rota não encontrada');
                break;
        }
    }
}
