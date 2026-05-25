/**
 * Camada de API - Simula chamadas a um backend REST
 * Todas as operações passam por aqui antes de chegar ao banco de dados
 */

import { db, UserRecord, SessionRecord, HoldingRecord, TransactionRecord, AlertRecord, WatchlistRecord, LogRecord } from './database';
import { hashPassword, verifyPassword, generateToken, generateId } from './crypto';
import { httpClient } from './http';

// === Tipos de Resposta ===

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// === Simulação de latência de rede ===

async function simulateNetworkDelay(): Promise<void> {
  const delay = 200 + Math.random() * 300; // 200-500ms
  await new Promise(resolve => setTimeout(resolve, delay));
}

// === API de Autenticação ===

export const authApi = {
  async register(name: string, email: string, password: string): Promise<ApiResponse<{ user: UserRecord; token: string }>> {
    await simulateNetworkDelay();

    try {
      // Validações
      if (!name || name.trim().length < 2) {
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Email inválido' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Verificar se email já existe
      const existing = await db.readByIndex('users', 'email', email);
      if (existing.length > 0) {
        return { success: false, error: 'Email já cadastrado' };
      }

      // Criar usuário
      const passwordHash = await hashPassword(password);
      const user: UserRecord = {
        id: generateId(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        balance: 10000, // Bônus de boas-vindas
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      await db.create('users', user);

      // Criar sessão
      const token = generateToken();
      const session: SessionRecord = {
        id: generateId(),
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        createdAt: new Date().toISOString(),
      };

      await db.create('sessions', session);

      // Log
      await db.create('logs', {
        id: generateId(),
        type: 'auth',
        userId: user.id,
        action: 'Registro',
        details: `Novo usuário registrado: ${email}`,
        timestamp: new Date().toISOString(),
      });

      // Retornar usuário sem hash
      const { passwordHash: _, ...userWithoutHash } = user;
      return { 
        success: true, 
        data: { user: userWithoutHash as UserRecord, token },
        message: 'Cadastro realizado com sucesso! Você ganhou $10.000 de bônus.'
      };
    } catch (err) {
      console.error('Erro no registro:', err);
      return { success: false, error: 'Erro interno ao cadastrar' };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<{ user: UserRecord; token: string }>> {
    await simulateNetworkDelay();

    try {
      if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      // Buscar usuário
      const users = await db.readByIndex('users', 'email', email.toLowerCase().trim());
      if (users.length === 0) {
        // Log de tentativa falha
        await db.create('logs', {
          id: generateId(),
          type: 'security',
          action: 'Tentativa de login falhou',
          details: `Email não encontrado: ${email}`,
          timestamp: new Date().toISOString(),
        });
        return { success: false, error: 'Email ou senha incorretos' };
      }

      const user = users[0];

      if (!user.isActive) {
        return { success: false, error: 'Conta desativada' };
      }

      // Verificar senha
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        await db.create('logs', {
          id: generateId(),
          type: 'security',
          userId: user.id,
          action: 'Tentativa de login falhou',
          details: 'Senha incorreta',
          timestamp: new Date().toISOString(),
        });
        return { success: false, error: 'Email ou senha incorretos' };
      }

      // Criar sessão
      const token = generateToken();
      const session: SessionRecord = {
        id: generateId(),
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      await db.create('sessions', session);

      // Atualizar último login
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      await db.update('users', user);

      // Log
      await db.create('logs', {
        id: generateId(),
        type: 'auth',
        userId: user.id,
        action: 'Login bem-sucedido',
        timestamp: new Date().toISOString(),
      });

      const { passwordHash: _, ...userWithoutHash } = user;
      return { 
        success: true, 
        data: { user: userWithoutHash as UserRecord, token }
      };
    } catch (err) {
      console.error('Erro no login:', err);
      return { success: false, error: 'Erro interno ao fazer login' };
    }
  },

  async logout(token: string): Promise<ApiResponse> {
    await simulateNetworkDelay();

    try {
      const sessions = await db.readByIndex('sessions', 'token', token);
      for (const session of sessions) {
        await db.delete('sessions', session.id);
      }
      return { success: true, message: 'Logout realizado' };
    } catch (err) {
      return { success: false, error: 'Erro ao fazer logout' };
    }
  },

  async validateSession(token: string): Promise<ApiResponse<UserRecord>> {
    try {
      const sessions = await db.readByIndex('sessions', 'token', token);
      if (sessions.length === 0) {
        return { success: false, error: 'Sessão inválida' };
      }

      const session = sessions[0];
      if (new Date(session.expiresAt) < new Date()) {
        await db.delete('sessions', session.id);
        return { success: false, error: 'Sessão expirada' };
      }

      const user = await db.read('users', session.userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const { passwordHash: _, ...userWithoutHash } = user;
      return { success: true, data: userWithoutHash as UserRecord };
    } catch (err) {
      return { success: false, error: 'Erro ao validar sessão' };
    }
  },
};

// === API de Usuário ===

export const userApi = {
  async getProfile(userId: string): Promise<ApiResponse<UserRecord>> {
    await simulateNetworkDelay();

    const user = await db.read('users', userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const { passwordHash: _, ...userWithoutHash } = user;
    return { success: true, data: userWithoutHash as UserRecord };
  },

  async updateProfile(userId: string, updates: Partial<UserRecord>): Promise<ApiResponse<UserRecord>> {
    await simulateNetworkDelay();

    const user = await db.read('users', userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const updated: UserRecord = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.update('users', updated);
    const { passwordHash: _, ...userWithoutHash } = updated;
    return { success: true, data: userWithoutHash as UserRecord };
  },

  async updateBalance(userId: string, amount: number): Promise<ApiResponse<UserRecord>> {
    const user = await db.read('users', userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const newBalance = user.balance + amount;
    if (newBalance < 0) {
      return { success: false, error: 'Saldo insuficiente' };
    }

    user.balance = newBalance;
    user.updatedAt = new Date().toISOString();
    await db.update('users', user);

    const { passwordHash: _, ...userWithoutHash } = user;
    return { success: true, data: userWithoutHash as UserRecord };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
    await simulateNetworkDelay();

    const user = await db.read('users', userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Nova senha deve ter pelo menos 6 caracteres' };
    }

    user.passwordHash = await hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    await db.update('users', user);

    return { success: true, message: 'Senha alterada com sucesso' };
  },
};

// === API de Trading ===

interface BackendHoldingPayload {
  id: number;
  userId: number;
  cryptoId: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  totalInvested: number;
  updatedAt: string;
}

interface BackendTransactionPayload {
  id: number;
  userId: number;
  type: 'buy' | 'sell';
  cryptoId: string;
  symbol: string;
  amount: number;
  price: number;
  fee: number;
  total: number;
  timestamp: string;
}

interface BackendSnapshotPayload {
  id: number;
  userId: number;
  cryptoId: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  totalInvested: number;
  currentValue: number;
  snapshotType: string;
  createdAt: string;
}

export interface PortfolioSnapshotRecord {
  id: string;
  userId: string;
  cryptoId: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  totalInvested: number;
  currentValue: number;
  snapshotType: string;
  createdAt: string;
}

function mapHolding(holding: BackendHoldingPayload): HoldingRecord {
  return {
    id: String(holding.id),
    userId: String(holding.userId),
    cryptoId: holding.cryptoId,
    symbol: holding.symbol,
    amount: Number(holding.amount),
    avgBuyPrice: Number(holding.avgBuyPrice),
    totalInvested: Number(holding.totalInvested),
    updatedAt: holding.updatedAt,
  };
}

function mapTransaction(transaction: BackendTransactionPayload): TransactionRecord {
  return {
    id: String(transaction.id),
    userId: String(transaction.userId),
    type: transaction.type,
    cryptoId: transaction.cryptoId,
    symbol: transaction.symbol,
    amount: Number(transaction.amount),
    price: Number(transaction.price),
    total: Number(transaction.total),
    fee: Number(transaction.fee),
    timestamp: transaction.timestamp,
  };
}

function mapSnapshot(snapshot: BackendSnapshotPayload): PortfolioSnapshotRecord {
  return {
    id: String(snapshot.id),
    userId: String(snapshot.userId),
    cryptoId: snapshot.cryptoId,
    symbol: snapshot.symbol,
    amount: Number(snapshot.amount),
    avgBuyPrice: Number(snapshot.avgBuyPrice),
    totalInvested: Number(snapshot.totalInvested),
    currentValue: Number(snapshot.currentValue),
    snapshotType: snapshot.snapshotType,
    createdAt: snapshot.createdAt,
  };
}

export const tradeApi = {
  async buy(userId: string, cryptoId: string, symbol: string, amount: number, price: number): Promise<ApiResponse<{ transaction: TransactionRecord; holding: HoldingRecord | null }>> {
    const result = await httpClient.post<{
      transaction?: BackendTransactionPayload;
      holding?: BackendHoldingPayload | null;
    }>('/trade/buy', {
      userId,
      cryptoId,
      symbol,
      amount,
      price,
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Não foi possível concluir a compra' };
    }

    const transaction = result.data?.transaction;
    const holding = result.data?.holding;

    if (!transaction) {
      return { success: false, error: 'Resposta inválida do servidor' };
    }

    return {
      success: true,
      data: {
        transaction: mapTransaction(transaction),
        holding: holding ? mapHolding(holding) : null,
      },
      message: `Compra de ${amount} ${symbol} realizada!`,
    };
  },

  async sell(userId: string, cryptoId: string, symbol: string, amount: number, price: number): Promise<ApiResponse<{ transaction: TransactionRecord }>> {
    const result = await httpClient.post<{
      transaction?: BackendTransactionPayload;
    }>('/trade/sell', {
      userId,
      cryptoId,
      symbol,
      amount,
      price,
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Não foi possível concluir a venda' };
    }

    const transaction = result.data?.transaction;

    if (!transaction) {
      return { success: false, error: 'Resposta inválida do servidor' };
    }

    return {
      success: true,
      data: { transaction: mapTransaction(transaction) },
      message: `Venda de ${amount} ${symbol} realizada!`,
    };
  },

  async getHoldings(_userId: string): Promise<ApiResponse<HoldingRecord[]>> {
    const result = await httpClient.get<{ holdings?: BackendHoldingPayload[] }>('/trade/holdings');

    if (!result.success) {
      return { success: false, error: result.error || 'Não foi possível carregar holdings' };
    }

    return {
      success: true,
      data: (result.data?.holdings ?? []).map(mapHolding),
    };
  },

  async getTransactions(_userId: string): Promise<ApiResponse<TransactionRecord[]>> {
    const result = await httpClient.get<{ transactions?: BackendTransactionPayload[] }>('/trade/transactions');

    if (!result.success) {
      return { success: false, error: result.error || 'Não foi possível carregar transações' };
    }

    return {
      success: true,
      data: (result.data?.transactions ?? []).map(mapTransaction),
    };
  },

  async getPortfolioSnapshots(_userId: string): Promise<ApiResponse<PortfolioSnapshotRecord[]>> {
    const result = await httpClient.get<{ snapshots?: BackendSnapshotPayload[] }>('/trade/snapshots');

    if (!result.success) {
      return { success: false, error: result.error || 'Não foi possível carregar snapshots' };
    }

    return {
      success: true,
      data: (result.data?.snapshots ?? []).map(mapSnapshot),
    };
  },
};

// === API de Watchlist ===

export const watchlistApi = {
  async get(userId: string | 'guest'): Promise<ApiResponse<WatchlistRecord>> {
    const records = await db.readByIndex('watchlist', 'userId', userId);
    if (records.length === 0) {
      // Criar watchlist vazia (sem favoritos pré-definidos)
      const newWatchlist: WatchlistRecord = {
        id: generateId(),
        userId,
        cryptoIds: [],
        updatedAt: new Date().toISOString(),
      };
      await db.create('watchlist', newWatchlist);
      return { success: true, data: newWatchlist };
    }
    return { success: true, data: records[0] };
  },

  async toggle(userId: string | 'guest', cryptoId: string): Promise<ApiResponse<WatchlistRecord>> {
    const records = await db.readByIndex('watchlist', 'userId', userId);
    let watchlist: WatchlistRecord;

    if (records.length === 0) {
      watchlist = {
        id: generateId(),
        userId,
        cryptoIds: [cryptoId],
        updatedAt: new Date().toISOString(),
      };
      await db.create('watchlist', watchlist);
    } else {
      watchlist = records[0];
      if (watchlist.cryptoIds.includes(cryptoId)) {
        watchlist.cryptoIds = watchlist.cryptoIds.filter((id) => id !== cryptoId);
      } else {
        watchlist.cryptoIds.push(cryptoId);
      }
      watchlist.updatedAt = new Date().toISOString();
      await db.update('watchlist', watchlist);
    }

    return { success: true, data: watchlist };
  },
};

// === API de Alertas ===

export const alertsApi = {
  async getAll(userId: string): Promise<ApiResponse<AlertRecord[]>> {
    await simulateNetworkDelay();
    const alerts = await db.readByIndex('alerts', 'userId', userId);
    const sorted = alerts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return { success: true, data: sorted };
  },

  async create(userId: string, alert: Omit<AlertRecord, 'id' | 'userId' | 'createdAt' | 'triggered' | 'notified'>): Promise<ApiResponse<AlertRecord>> {
    await simulateNetworkDelay();

    const newAlert: AlertRecord = {
      ...alert,
      id: generateId(),
      userId,
      createdAt: new Date().toISOString(),
      triggered: false,
      notified: false,
    };

    await db.create('alerts', newAlert);
    return { success: true, data: newAlert, message: 'Alerta criado' };
  },

  async update(id: string, updates: Partial<AlertRecord>): Promise<ApiResponse<AlertRecord>> {
    const alert = await db.read('alerts', id);
    if (!alert) {
      return { success: false, error: 'Alerta não encontrado' };
    }

    const updated = { ...alert, ...updates };
    await db.update('alerts', updated);
    return { success: true, data: updated };
  },

  async delete(id: string): Promise<ApiResponse> {
    await db.delete('alerts', id);
    return { success: true, message: 'Alerta removido' };
  },
};

// === API Admin ===

export const adminApi = {
  async getAllUsers(): Promise<ApiResponse<UserRecord[]>> {
    await simulateNetworkDelay();
    const users = await db.readAll('users');
    const usersWithoutHash = users.map(({ passwordHash: _, ...u }) => u as UserRecord);
    return { success: true, data: usersWithoutHash };
  },

  async getStats(): Promise<ApiResponse> {
    await simulateNetworkDelay();
    const users = await db.readAll('users');
    const transactions = await db.readAll('transactions');
    const logs = await db.readAll('logs');

    return {
      success: true,
      data: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.isActive).length,
        totalTransactions: transactions.length,
        totalVolume: transactions.reduce((sum, t) => sum + t.total, 0),
        totalLogs: logs.length,
      },
    };
  },

  async getLogs(limit: number = 50): Promise<ApiResponse<LogRecord[]>> {
    await simulateNetworkDelay();
    const logs = await db.readAll('logs');
    const sorted = logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return { success: true, data: sorted.slice(0, limit) };
  },

  async toggleUserStatus(userId: string): Promise<ApiResponse<UserRecord>> {
    const user = await db.read('users', userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();
    await db.update('users', user);

    await db.create('logs', {
      id: generateId(),
      type: 'system',
      userId,
      action: user.isActive ? 'Usuário reativado' : 'Usuário banido',
      timestamp: new Date().toISOString(),
    });

    const { passwordHash: _, ...userWithoutHash } = user;
    return { success: true, data: userWithoutHash as UserRecord };
  },

  async exportDatabase(): Promise<ApiResponse<Record<string, any[]>>> {
    const data = await db.export();
    return { success: true, data };
  },
};
