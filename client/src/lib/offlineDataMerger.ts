/**
 * Offline Data Merger
 * 
 * Mescla dados do cache de API com dados pendentes de sincronização
 * para que alterações offline apareçam imediatamente na interface
 */

const SYNC_DB_NAME = '7care-sync-db';
const SYNC_STORE_NAME = 'sync-queue';
const LOCAL_DATA_STORE = 'local-data';

interface LocalDataItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: any;
  timestamp: number;
}

class OfflineDataMerger {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SYNC_DB_NAME, 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store de fila de sincronização (já existe da v1)
        if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
          const syncStore = db.createObjectStore(SYNC_STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store de dados locais (novos itens criados offline)
        if (!db.objectStoreNames.contains(LOCAL_DATA_STORE)) {
          const dataStore = db.createObjectStore(LOCAL_DATA_STORE, { 
            keyPath: 'id'
          });
          dataStore.createIndex('endpoint', 'endpoint', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveLocalData(endpoint: string, method: string, data: any): Promise<string> {
    if (!this.db) await this.init();

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LOCAL_DATA_STORE], 'readwrite');
      const store = transaction.objectStore(LOCAL_DATA_STORE);

      const item: LocalDataItem = {
        id: tempId,
        endpoint,
        method: method as any,
        data: { ...data, id: tempId, _tempId: tempId, _pendingSync: true },
        timestamp: Date.now()
      };

      const request = store.put(item);

      request.onsuccess = () => {
        console.log(`💾 Local data saved:`, { endpoint, tempId });
        resolve(tempId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getLocalDataByEndpoint(endpoint: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LOCAL_DATA_STORE], 'readonly');
      const store = transaction.objectStore(LOCAL_DATA_STORE);
      const index = store.index('endpoint');
      const request = index.getAll(endpoint);

      request.onsuccess = () => {
        const items = (request.result || []).map(item => item.data);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeLocalData(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LOCAL_DATA_STORE], 'readwrite');
      const store = transaction.objectStore(LOCAL_DATA_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LOCAL_DATA_STORE], 'readwrite');
      const store = transaction.objectStore(LOCAL_DATA_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Dados locais sincronizados removidos');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mescla dados da API com dados locais pendentes
   */
  async mergeWithLocalData(endpoint: string, apiData: any[]): Promise<any[]> {
    try {
      // Normalizar endpoint (remover query params para matching)
      const normalizedEndpoint = endpoint.split('?')[0];
      
      // Buscar dados locais para este endpoint
      const localData = await this.getLocalDataByEndpoint(normalizedEndpoint);
      
      if (localData.length === 0) {
        return apiData;
      }

      console.log(`🔀 Mesclando dados: ${apiData.length} da API + ${localData.length} locais`);
      
      // Mesclar: dados locais primeiro (são os mais recentes criados offline)
      const merged = [...localData, ...apiData];
      
      return merged;
    } catch (error) {
      console.error('❌ Erro ao mesclar dados:', error);
      return apiData; // Fallback para dados da API apenas
    }
  }
}

// Exportar instância singleton
export const dataMerger = new OfflineDataMerger();

// Inicializar automaticamente
dataMerger.init().catch(console.error);

// Limpar dados locais após sincronização bem-sucedida
if (typeof window !== 'undefined') {
  window.addEventListener('syncComplete', async (event: any) => {
    const { success } = event.detail || {};
    if (success > 0) {
      console.log('🧹 Limpando dados locais sincronizados...');
      await dataMerger.clearSyncedData();
      
      // Recarregar dados para pegar IDs reais do servidor
      window.location.reload();
    }
  });
}

