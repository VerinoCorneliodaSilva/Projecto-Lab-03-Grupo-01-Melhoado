/**
 * Configurações globais da aplicação
 * Centraliza URLs de API e constantes do sistema
 */

export const config = {
  // URL base do backend PHP (altere conforme o ambiente local)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost/TIC-Projetos/Lab-03-01-Melhorado/backend/api/',

  // Timeouts (em ms)
  requestTimeout: 30000,
  realtimeInterval: 3000,
  alertCheckInterval: 5000,

  // Taxas
  tradeFeeRate: 0.001, // 0.1%

  // Bônus inicial
  welcomeBonus: 10000,

  // Limites
  maxAlertsPerUser: 50,
  maxTransactionsHistory: 100,

  // Features
  features: {
    enableNotifications: true,
    enableRealtimePrices: true,
    enableTrading: true,
    enableAiPredictions: true,
  },
} as const;

export type AppConfig = typeof config;
