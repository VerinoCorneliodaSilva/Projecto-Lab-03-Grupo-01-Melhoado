/**
 * Camada de API - Simula chamadas a um backend REST
 * Todas as operações passam por aqui antes de chegar ao banco de dados
 */

import { db, UserRecord, SessionRecord, HoldingRecord, TransactionRecord, AlertRecord, WatchlistRecord, LogRecord } from './database';
import { hashPassword, verifyPassword, generateToken, generateId } from './crypto';

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

export const tradeApi = {
  async buy(userId: string, cryptoId: string, symbol: string, amount: number, price: number): Promise<ApiResponse<{ transaction: TransactionRecord; holding: HoldingRecord | null }>> {
    await simulateNetworkDelay();

    const FEE_RATE = 0.001;
    const subtotal = amount * price;
    const fee = subtotal * FEE_RATE;
    const total = subtotal + fee;

    // Verificar saldo
    const user = await db.read('users', userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (user.balance < total) {
      return { success: false, error: 'Saldo insuficiente' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Quantidade inválida' };
    }

    // Criar transação
    const transaction: TransactionRecord = {
      id: generateId(),
      userId,
      type: 'buy',
      cryptoId,
      symbol,
      amount,
      price,
      total,
      fee,
      timestamp: new Date().toISOString(),
    };

    await db.create('transactions', transaction);

    // Atualizar ou criar holding
    const holdings = await db.readByIndex('holdings', 'userId', userId);
    let holding = holdings.find((h) => h.cryptoId === cryptoId);

    if (holding) {
      const newAmount = holding.amount + amount;
      const newTotalInvested = holding.totalInvested + total;
      holding = {
        ...holding,
        amount: newAmount,
        avgBuyPrice: newTotalInvested / newAmount,
        totalInvested: newTotalInvested,
        updatedAt: new Date().toISOString(),
      };
      await db.update('holdings', holding);
    } else {
      holding = {
        id: generateId(),
        userId,
        cryptoId,
        symbol,
        amount,
        avgBuyPrice: total / amount,
        totalInvested: total,
        updatedAt: new Date().toISOString(),
      };
      await db.create('holdings', holding);
    }

    // Atualizar saldo
    user.balance -= total;
    user.updatedAt = new Date().toISOString();
    await db.update('users', user);

    // Log
    await db.create('logs', {
      id: generateId(),
      type: 'trade',
      userId,
      action: 'Compra',
      details: `Comprou ${amount} ${symbol} por $${total.toFixed(2)}`,
      timestamp: new Date().toISOString(),
    });

    return { 
      success: true, 
      data: { transaction, holding },
      message: `Compra de ${amount} ${symbol} realizada!`
    };
  },

  async sell(userId: string, cryptoId: string, symbol: string, amount: number, price: number): Promise<ApiResponse<{ transaction: TransactionRecord }>> {
    await simulateNetworkDelay();

    const FEE_RATE = 0.001;
    const subtotal = amount * price;
    const fee = subtotal * FEE_RATE;
    const total = subtotal - fee;

    // Verificar holding
    const holdings = await db.readByIndex('holdings', 'userId', userId);
    const holding = holdings.find((h) => h.cryptoId === cryptoId);

    if (!holding || holding.amount < amount) {
      return { success: false, error: 'Quantidade insuficiente' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Quantidade inválida' };
    }

    // Criar transação
    const transaction: TransactionRecord = {
      id: generateId(),
      userId,
      type: 'sell',
      cryptoId,
      symbol,
      amount,
      price,
      total,
      fee,
      timestamp: new Date().toISOString(),
    };

    await db.create('transactions', transaction);

    // Atualizar holding
    const newAmount = holding.amount - amount;
    if (newAmount < 0.00000001) {
      await db.delete('holdings', holding.id);
    } else {
      const newTotalInvested = (holding.totalInvested / holding.amount) * newAmount;
      holding.amount = newAmount;
      holding.totalInvested = newTotalInvested;
      holding.updatedAt = new Date().toISOString();
      await db.update('holdings', holding);
    }

    // Atualizar saldo
    const user = await db.read('users', userId);
    if (user) {
      user.balance += total;
      user.updatedAt = new Date().toISOString();
      await db.update('users', user);
    }

    // Log
    await db.create('logs', {
      id: generateId(),
      type: 'trade',
      userId,
      action: 'Venda',
      details: `Vendeu ${amount} ${symbol} por $${total.toFixed(2)}`,
      timestamp: new Date().toISOString(),
    });

    return { 
      success: true, 
      data: { transaction },
      message: `Venda de ${amount} ${symbol} realizada!`
    };
  },

  async getHoldings(userId: string): Promise<ApiResponse<HoldingRecord[]>> {
    await simulateNetworkDelay();
    const holdings = await db.readByIndex('holdings', 'userId', userId);
    return { success: true, data: holdings };
  },

  async getTransactions(userId: string, limit: number = 50): Promise<ApiResponse<TransactionRecord[]>> {
    await simulateNetworkDelay();
    const transactions = await db.readByIndex('transactions', 'userId', userId);
    const sorted = transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return { success: true, data: sorted.slice(0, limit) };
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
