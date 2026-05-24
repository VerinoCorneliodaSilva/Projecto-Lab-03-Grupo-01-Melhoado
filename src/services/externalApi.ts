/**
 * Integração com APIs externas (Backend PHP)
 * 
 * Esta camada abstrai chamadas ao backend PHP real.
 * Quando o backend estiver disponível, basta descomentar as chamadas HTTP.
 * 
 * Uso:
 *   import { externalPricesApi } from '@/services/externalApi';
 *   const prices = await externalPricesApi.getAll();
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { httpClient } from './http';

export interface ExternalUser {
  id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
}

export interface ExternalPrice {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  updatedAt: string;
}

/**
 * Helper para executar chamada HTTP ou retornar fallback
 */
const callOrFallback = async <T>(_fn: () => Promise<T>, fallback: T | null = null): Promise<T | null> => {
  // TODO: Descomentar quando backend PHP estiver pronto
  // try {
  //   const result = await fn();
  //   return result;
  // } catch {
  //   return fallback;
  // }
  return fallback;
};

/**
 * API de Autenticação Externa
 */
export const externalAuthApi = {
  login: (email: string, password: string) => callOrFallback(
    () => httpClient.post<{ user: ExternalUser; token: string }>('/auth/login', { email, password })
  ),

  register: (name: string, email: string, password: string) => callOrFallback(
    () => httpClient.post<{ user: ExternalUser; token: string }>('/auth/register', { name, email, password })
  ),

  validateToken: (token: string) => callOrFallback(
    () => httpClient.get<ExternalUser>('/auth/validate', { headers: { Authorization: `Bearer ${token}` } })
  ),

  logout: () => callOrFallback(
    () => httpClient.post('/auth/logout')
  ),
};

/**
 * API de Preços Externa
 */
export const externalPricesApi = {
  getAll: () => callOrFallback(
    () => httpClient.get<ExternalPrice[]>('/prices')
  ),

  getById: (id: string) => callOrFallback(
    () => httpClient.get<ExternalPrice>(`/prices/${id}`)
  ),

  getHistory: (id: string, days: number = 30) => callOrFallback(
    () => httpClient.get<{ date: string; price: number }[]>(`/prices/${id}/history?days=${days}`)
  ),
};

/**
 * API de Trading Externa
 */
export const externalTradeApi = {
  buy: (userId: string, cryptoId: string, amount: number) => callOrFallback(
    () => httpClient.post('/trade/buy', { userId, cryptoId, amount })
  ),

  sell: (userId: string, cryptoId: string, amount: number) => callOrFallback(
    () => httpClient.post('/trade/sell', { userId, cryptoId, amount })
  ),

  getTransactions: (userId: string) => callOrFallback(
    () => httpClient.get(`/trade/transactions?userId=${userId}`)
  ),

  getHoldings: (userId: string) => callOrFallback(
    () => httpClient.get(`/trade/holdings?userId=${userId}`)
  ),
};

/**
 * API de Notícias Externa
 */
export const externalNewsApi = {
  getAll: (category?: string) => callOrFallback(
    () => httpClient.get(`/news${category ? `?category=${category}` : ''}`)
  ),

  getById: (id: string) => callOrFallback(
    () => httpClient.get(`/news/${id}`)
  ),
};

/**
 * API de Alertas Externa
 */
export const externalAlertsApi = {
  getAll: (userId: string) => callOrFallback(
    () => httpClient.get(`/alerts?userId=${userId}`)
  ),

  create: (alert: any) => callOrFallback(
    () => httpClient.post('/alerts', alert)
  ),

  delete: (id: string) => callOrFallback(
    () => httpClient.delete(`/alerts/${id}`)
  ),
};
