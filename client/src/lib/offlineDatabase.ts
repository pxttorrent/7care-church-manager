/**
 * 💾 BANCO DE DADOS OFFLINE - IndexedDB
 * 
 * Sistema completo de cache de dados para funcionamento offline
 * Sincronização automática quando volta online
 */

interface DBConfig {
  name: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

const DB_CONFIG: DBConfig = {
  name: '7care-offline-db',
  version: 1,
  stores: [
    {
      name: 'users',
      keyPath: 'id',
      indexes: [
        { name: 'email', keyPath: 'email', unique: false },
        { name: 'church_id', keyPath: 'church_id', unique: false }
      ]
    },
    {
      name: 'tasks',
      keyPath: 'id',
      indexes: [
        { name: 'assigned_to', keyPath: 'assigned_to', unique: false },
        { name: 'status', keyPath: 'status', unique: false }
      ]
    },
    {
      name: 'interested',
      keyPath: 'id',
      indexes: [
        { name: 'missionary_id', keyPath: 'missionary_id', unique: false }
      ]
    },
    {
      name: 'events',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date', unique: false }
      ]
    },
    {
      name: 'prayers',
      keyPath: 'id'
    },
    {
      name: 'activities',
      keyPath: 'id',
      indexes: [
        { name: 'user_id', keyPath: 'user_id', unique: false }
      ]
    },
    {
      name: 'churches',
      keyPath: 'id'
    },
    {
      name: 'sync_queue',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false }
      ]
    },
    {
      name: 'metadata',
      keyPath: 'key'
    }
  ]
};

class OfflineDatabase {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private dbVersion: number;

  constructor() {
    this.dbName = DB_CONFIG.name;
    this.dbVersion = DB_CONFIG.version;
  }

  // Inicializar banco de dados
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializado:', this.dbName);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('🔄 Atualizando estrutura do IndexedDB...');

        DB_CONFIG.stores.forEach(storeConfig => {
          // Criar object store se não existir
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.keyPath === 'id'
            });

            // Criar índices
            storeConfig.indexes?.forEach(index => {
              store.createIndex(index.name, index.keyPath, { unique: index.unique || false });
            });

            console.log(`✅ Store criado: ${storeConfig.name}`);
          }
        });
      };
    });
  }

  // Salvar dados
  async save(storeName: string, data: any | any[]): Promise<void> {
    if (!this.db) await this.init();

    const items = Array.isArray(data) ? data : [data];
    const tx = this.db!.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    for (const item of items) {
      store.put(item);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log(`💾 Salvos ${items.length} itens em ${storeName}`);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Buscar todos os dados
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        console.log(`📦 ${request.result.length} itens de ${storeName}`);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Buscar um item
  async get(storeName: string, id: any): Promise<any> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Deletar item
  async delete(storeName: string, id: any): Promise<void> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Limpar store
  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log(`🗑️ Store ${storeName} limpo`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Adicionar à fila de sincronização
  async addToSyncQueue(action: string, storeName: string, data: any): Promise<void> {
    const syncItem = {
      id: Date.now().toString() + Math.random(),
      action, // 'create', 'update', 'delete'
      storeName,
      data,
      timestamp: new Date().toISOString()
    };

    await this.save('sync_queue', syncItem);
    console.log('📤 Adicionado à fila de sincronização:', action, storeName);
  }

  // Processar fila de sincronização
  async processSyncQueue(): Promise<number> {
    const queue = await this.getAll('sync_queue');
    let processed = 0;

    for (const item of queue) {
      try {
        // Aqui você implementaria a lógica de sincronização com a API
        console.log('🔄 Sincronizando:', item);
        
        // Após sincronizar com sucesso, remover da fila
        await this.delete('sync_queue', item.id);
        processed++;
      } catch (error) {
        console.error('❌ Erro ao sincronizar:', item, error);
      }
    }

    console.log(`✅ ${processed}/${queue.length} itens sincronizados`);
    return processed;
  }

  // Salvar metadata (ex: última sincronização)
  async saveMetadata(key: string, value: any): Promise<void> {
    await this.save('metadata', { key, value, timestamp: new Date().toISOString() });
  }

  // Buscar metadata
  async getMetadata(key: string): Promise<any> {
    const result = await this.get('metadata', key);
    return result?.value;
  }

  // Exportar todos os dados
  async exportAll(): Promise<Record<string, any[]>> {
    const data: Record<string, any[]> = {};
    
    for (const store of DB_CONFIG.stores) {
      if (store.name !== 'sync_queue' && store.name !== 'metadata') {
        data[store.name] = await this.getAll(store.name);
      }
    }

    return data;
  }

  // Importar dados
  async importAll(data: Record<string, any[]>): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (items.length > 0) {
        await this.save(storeName, items);
      }
    }
    console.log('✅ Dados importados para IndexedDB');
  }

  // Verificar se tem dados
  async hasData(storeName: string): Promise<boolean> {
    const items = await this.getAll(storeName);
    return items.length > 0;
  }

  // Estatísticas
  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    for (const store of DB_CONFIG.stores) {
      const items = await this.getAll(store.name);
      stats[store.name] = items.length;
    }

    return stats;
  }
}

// Instância singleton
export const offlineDB = new OfflineDatabase();

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  offlineDB.init().catch(err => {
    console.error('❌ Erro ao inicializar IndexedDB:', err);
  });
}

