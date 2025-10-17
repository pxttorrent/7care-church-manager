/**
 * Gerenciador de banco de dados offline usando IndexedDB
 * Base para o sistema de sincronização avançada
 */

interface CachedData {
  data: any;
  timestamp: number;
  version: string;
  etag?: string;
}

interface DatabaseConfig {
  name: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes: Array<{
      name: string;
      keyPath: string;
      unique?: boolean;
    }>;
  }[];
}

const DB_CONFIG: DatabaseConfig = {
  name: '7care-offline-db',
  version: 1,
  stores: [
    {
      name: 'cachedData',
      keyPath: 'endpoint',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'version', keyPath: 'version', unique: false }
      ]
    },
    {
      name: 'syncQueue',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'type', keyPath: 'type', unique: false },
        { name: 'endpoint', keyPath: 'endpoint', unique: false }
      ]
    }
  ]
};

export class OfflineDatabase {
  private static instance: OfflineDatabase;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): OfflineDatabase {
    if (!OfflineDatabase.instance) {
      OfflineDatabase.instance = new OfflineDatabase();
    }
    return OfflineDatabase.instance;
  }

  /**
   * Inicializa o banco de dados offline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => {
        console.error('❌ Erro ao abrir banco offline:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ Banco offline inicializado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar stores se não existirem
        for (const storeConfig of DB_CONFIG.stores) {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { 
              keyPath: storeConfig.keyPath 
            });
            
            // Criar índices
            for (const indexConfig of storeConfig.indexes) {
              store.createIndex(
                indexConfig.name, 
                indexConfig.keyPath, 
                { unique: indexConfig.unique || false }
              );
            }
          }
        }
      };
    });
  }

  /**
   * Verifica se o banco está disponível
   */
  isAvailable(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Salva dados no cache offline
   */
  async cacheData(endpoint: string, data: any, etag?: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Banco offline não está disponível');
    }

    const cachedData: CachedData = {
      data,
      timestamp: Date.now(),
      version: '1.0',
      etag
    };

    const transaction = this.db!.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ endpoint, ...cachedData });
      
      request.onsuccess = () => {
        console.log(`💾 Dados salvos no cache: ${endpoint}`);
        resolve();
      };
      
      request.onerror = () => {
        console.error(`❌ Erro ao salvar cache: ${endpoint}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Recupera dados do cache offline
   */
  async getCachedData(endpoint: string, maxAge?: number): Promise<any | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const maxAgeMs = maxAge || 24 * 60 * 60 * 1000; // 24 horas por padrão

    const transaction = this.db!.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve) => {
      const request = store.get(endpoint);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Verificar se o cache não está muito antigo
        const isStale = Date.now() - result.timestamp > maxAgeMs;
        
        if (isStale) {
          console.log(`⏰ Cache expirado: ${endpoint}`);
          resolve(null);
        } else {
          console.log(`📋 Cache encontrado: ${endpoint}`);
          resolve(result.data);
        }
      };
      
      request.onerror = () => {
        console.error(`❌ Erro ao buscar cache: ${endpoint}`, request.error);
        resolve(null);
      };
    });
  }

  /**
   * Remove dados do cache
   */
  async removeCachedData(endpoint: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    const transaction = this.db!.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(endpoint);
      
      request.onsuccess = () => {
        console.log(`🗑️ Cache removido: ${endpoint}`);
        resolve();
      };
      
      request.onerror = () => {
        console.error(`❌ Erro ao remover cache: ${endpoint}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpa cache antigo
   */
  async cleanupOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    const cutoffTime = Date.now() - maxAge;
    
    const transaction = this.db!.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const index = store.index('timestamp');
    
    const range = IDBKeyRange.upperBound(cutoffTime);
    const request = index.openCursor(range);
    
    return new Promise((resolve) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          console.log(`🗑️ Removendo cache antigo: ${cursor.value.endpoint}`);
          cursor.delete();
          cursor.continue();
        } else {
          console.log('✅ Limpeza de cache concluída');
          resolve();
        }
      };
      
      request.onerror = () => {
        console.error('❌ Erro na limpeza de cache:', request.error);
        resolve();
      };
    });
  }

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
  }> {
    if (!this.isAvailable()) {
      return {
        totalItems: 0,
        totalSize: 0,
        oldestItem: 0,
        newestItem: 0
      };
    }

    const transaction = this.db!.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    
    return new Promise((resolve) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result;
        
        const stats = {
          totalItems: items.length,
          totalSize: JSON.stringify(items).length,
          oldestItem: items.length > 0 ? Math.min(...items.map(i => i.timestamp)) : 0,
          newestItem: items.length > 0 ? Math.max(...items.map(i => i.timestamp)) : 0
        };
        
        resolve(stats);
      };
      
      request.onerror = () => {
        resolve({
          totalItems: 0,
          totalSize: 0,
          oldestItem: 0,
          newestItem: 0
        });
      };
    });
  }
}

// Instância singleton
export const offlineDB = OfflineDatabase.getInstance();
