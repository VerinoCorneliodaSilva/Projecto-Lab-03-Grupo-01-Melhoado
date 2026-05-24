import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tradeApi, watchlistApi } from '../services/api';
import { HoldingRecord, TransactionRecord, WatchlistRecord } from '../services/database';

export interface PortfolioData {
  holdings: HoldingRecord[];
  transactions: TransactionRecord[];
  watchlist: WatchlistRecord | null;
  isLoading: boolean;
  buy: (cryptoId: string, symbol: string, amount: number, price: number) => Promise<{ success: boolean; error?: string; message?: string }>;
  sell: (cryptoId: string, symbol: string, amount: number, price: number) => Promise<{ success: boolean; error?: string; message?: string }>;
  toggleWatchlist: (cryptoId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePortfolio(): PortfolioData {
  const { user, refreshUser } = useAuth();
  const [holdings, setHoldings] = useState<HoldingRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setHoldings([]);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [holdingsRes, txRes, watchRes] = await Promise.all([
        tradeApi.getHoldings(user.id),
        tradeApi.getTransactions(user.id),
        watchlistApi.get(user.id),
      ]);
      if (holdingsRes.success) setHoldings(holdingsRes.data || []);
      if (txRes.success) setTransactions(txRes.data || []);
      if (watchRes.success) setWatchlist(watchRes.data || null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Carregar watchlist de guest quando não logado
  useEffect(() => {
    if (!user) {
      watchlistApi.get('guest').then((res) => {
        if (res.success) setWatchlist(res.data || null);
      });
    }
  }, [user]);

  const buy = useCallback(async (cryptoId: string, symbol: string, amount: number, price: number) => {
    if (!user) return { success: false, error: 'Você precisa estar logado' };
    const result = await tradeApi.buy(user.id, cryptoId, symbol, amount, price);
    if (result.success) {
      await refresh();
      await refreshUser();
      return { success: true, message: result.message };
    }
    return { success: false, error: result.error };
  }, [user, refresh, refreshUser]);

  const sell = useCallback(async (cryptoId: string, symbol: string, amount: number, price: number) => {
    if (!user) return { success: false, error: 'Você precisa estar logado' };
    const result = await tradeApi.sell(user.id, cryptoId, symbol, amount, price);
    if (result.success) {
      await refresh();
      await refreshUser();
      return { success: true, message: result.message };
    }
    return { success: false, error: result.error };
  }, [user, refresh, refreshUser]);

  const toggleWatchlist = useCallback(async (cryptoId: string) => {
    const userId = user?.id || 'guest';
    const result = await watchlistApi.toggle(userId, cryptoId);
    if (result.success) {
      setWatchlist(result.data || null);
    }
  }, [user]);

  return { holdings, transactions, watchlist, isLoading, buy, sell, toggleWatchlist, refresh };
}
