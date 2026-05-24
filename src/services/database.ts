/**
 * Sistema de Banco de Dados - IndexedDB com fallback para localStorage
 * Simula um backend real com operações CRUD completas
 */

export interface DBSchema {
  users: UserRecord;
  sessions: SessionRecord;
  holdings: HoldingRecord;
  transactions: TransactionRecord;
  watchlist: WatchlistRecord;
  alerts: AlertRecord;
  settings: SettingRecord;
  logs: LogRecord;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface HoldingRecord {
  id: string;
  userId: string;
  cryptoId: string;
  symbol: string;
  amount: number;
  avgBuyPrice: number;
  totalInvested: number;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  cryptoId: string;
  symbol: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  timestamp: string;
}

export interface WatchlistRecord {
  id: string;
  userId: string | 'guest';
  cryptoIds: string[];
  updatedAt: string;
}

export interface AlertRecord {
  id: string;
  userId: string;
  cryptoId: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'change_up' | 'change_down';
  value: number;
  active: boolean;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  notified?: boolean;
}

export interface SettingRecord {
  id: string;
  userId: string | 'guest';
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  notifications: {
    price: boolean;
    transactions: boolean;
    news: boolean;
  };
}

export interface LogRecord {
  id: string;
  type: 'auth' | 'trade' | 'system' | 'error' | 'security';
  userId?: string;
  action: string;
  details?: string;
  ip?: string;
  timestamp: string;
}

const DB_NAME = 'cryptonova_db';
const DB_VERSION = 1;
const STORES: (keyof DBSchema)[] = [
  'users', 'sessions', 'holdings', 'transactions',
  'watchlist', 'alerts', 'settings', 'logs'
];

class Database {
  private db: IDBDatabase | null = null;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDB não disponível, usando fallback');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // Criar índices comuns
            if (storeName === 'holdings' || storeName === 'transactions' || 
                storeName === 'alerts' || storeName === 'logs') {
              store.createIndex('userId', 'userId', { unique: false });
            }
            if (storeName === 'users') {
              store.createIndex('email', 'email', { unique: true });
            }
            if (storeName === 'sessions') {
              store.createIndex('token', 'token', { unique: true });
              store.createIndex('userId', 'userId', { unique: false });
            }
            if (storeName === 'watchlist' || storeName === 'settings') {
              store.createIndex('userId', 'userId', { unique: false });
            }
          }
        });
      };
    });
  }

  async waitForReady(): Promise<void> {
    await this.ready;
  }

  // === Operações CRUD ===
  
  async create<T extends keyof DBSchema>(
    storeName: T,
    data: DBSchema[T]
  ): Promise<DBSchema[T]> {
    await this.waitForReady();
    
    if (!this.db) {
      // Fallback para localStorage
      return this.localStorageFallback('create', storeName, data);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async read<T extends keyof DBSchema>(
    storeName: T,
    id: string
  ): Promise<DBSchema[T] | null> {
    await this.waitForReady();
    
    if (!this.db) {
      return this.localStorageFallback('read', storeName, { id } as DBSchema[T]);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async readByIndex<T extends keyof DBSchema>(
    storeName: T,
    indexName: string,
    value: any
  ): Promise<DBSchema[T][]> {
    await this.waitForReady();
    
    if (!this.db) {
      return this.localStorageFallback('readByIndex', storeName, null, { indexName, value });
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async readAll<T extends keyof DBSchema>(
    storeName: T
  ): Promise<DBSchema[T][]> {
    await this.waitForReady();
    
    if (!this.db) {
      return this.localStorageFallback('readAll', storeName, null);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T extends keyof DBSchema>(
    storeName: T,
    data: DBSchema[T]
  ): Promise<DBSchema[T]> {
    await this.waitForReady();
    
    if (!this.db) {
      return this.localStorageFallback('update', storeName, data);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async delete<T extends keyof DBSchema>(
    storeName: T,
    id: string
  ): Promise<void> {
    await this.waitForReady();
    
    if (!this.db) {
      return this.localStorageFallback('delete', storeName, { id } as DBSchema[T]);
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteByIndex<T extends keyof DBSchema>(
    storeName: T,
    indexName: string,
    value: any
  ): Promise<number> {
    const records = await this.readByIndex(storeName, indexName, value);
    let deleted = 0;
    for (const record of records) {
      await this.delete(storeName, (record as any).id);
      deleted++;
    }
    return deleted;
  }

  async count<T extends keyof DBSchema>(storeName: T): Promise<number> {
    const all = await this.readAll(storeName);
    return all.length;
  }

  // === Fallback para localStorage ===
  
  private localStorageFallback<T extends keyof DBSchema>(
    operation: string,
    storeName: T,
    data: DBSchema[T] | null,
    options?: { indexName?: string; value?: any }
  ): any {
    const key = `cn_${storeName}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');

    switch (operation) {
      case 'create':
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        return data;
      
      case 'read':
        return existing.find((item: any) => item.id === (data as any).id) || null;
      
      case 'readByIndex':
        return existing.filter((item: any) => 
          item[options!.indexName!] === options!.value
        );
      
      case 'readAll':
        return existing;
      
      case 'update':
        const idx = existing.findIndex((item: any) => item.id === (data as any).id);
        if (idx >= 0) {
          existing[idx] = data;
          localStorage.setItem(key, JSON.stringify(existing));
        }
        return data;
      
      case 'delete':
        const filtered = existing.filter((item: any) => item.id !== (data as any).id);
        localStorage.setItem(key, JSON.stringify(filtered));
        return;
      
      default:
        return null;
    }
  }

  // === Utilitários ===

  async clear<T extends keyof DBSchema>(storeName: T): Promise<void> {
    await this.waitForReady();
    
    if (!this.db) {
      localStorage.removeItem(`cn_${storeName}`);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async export(): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};
    for (const storeName of STORES) {
      result[storeName] = await this.readAll(storeName);
    }
    return result;
  }

  async import(data: Record<string, any[]>): Promise<void> {
    for (const [storeName, records] of Object.entries(data)) {
      await this.clear(storeName as keyof DBSchema);
      for (const record of records) {
        await this.create(storeName as keyof DBSchema, record);
      }
    }
  }
}

// Singleton
export const db = new Database();
