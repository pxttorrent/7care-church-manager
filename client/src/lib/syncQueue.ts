/**
 * Sync Queue - Sistema de sincronização offline
 * 
 * Permite criar/editar dados offline e sincronizar quando voltar online
 */

const DB_NAME = '7care-sync-db';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  body: any;
  headers: Record<string, string>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retries: number;
  tempId?: string; // ID temporário para referência local
}

class SyncQueueManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ SyncQueue DB inicializado');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('✅ Object store criado:', STORE_NAME);
        }
      };
    });
  }

  async addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const queueItem: Omit<SyncQueueItem, 'id'> = {
        ...item,
        timestamp: Date.now(),
        status: 'pending',
        retries: 0
      };

      const request = store.add(queueItem);

      request.onsuccess = () => {
        const id = request.result as number;
        console.log(`📥 Item adicionado à fila de sync:`, { id, url: item.url, method: item.method });
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateItemStatus(id: number, status: 'pending' | 'syncing' | 'completed' | 'failed'): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeItem(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ Item removido da fila:`, id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async syncPendingItems(): Promise<{ success: number; failed: number }> {
    const pendingItems = await this.getPendingItems();
    console.log(`🔄 Sincronizando ${pendingItems.length} itens pendentes...`);

    let success = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        await this.updateItemStatus(item.id!, 'syncing');

        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body)
        });

        if (response.ok) {
          await this.updateItemStatus(item.id!, 'completed');
          await this.removeItem(item.id!);
          console.log(`✅ Sincronizado: ${item.method} ${item.url}`);
          success++;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar item ${item.id}:`, error);
        await this.updateItemStatus(item.id!, 'failed');
        failed++;
      }
    }

    console.log(`🔄 Sincronização completa: ${success} sucesso, ${failed} falhas`);
    return { success, failed };
  }

  async getPendingCount(): Promise<number> {
    const items = await this.getPendingItems();
    return items.length;
  }

  async clearCompleted(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.openCursor(IDBKeyRange.only('completed'));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Exportar instância singleton
export const syncQueue = new SyncQueueManager();

// Inicializar automaticamente
syncQueue.init().catch(console.error);

// Auto-sync quando voltar online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('🌐 Voltou online! Iniciando sincronização...');
    try {
      const result = await syncQueue.syncPendingItems();
      if (result.success > 0) {
        console.log(`✅ ${result.success} itens sincronizados com sucesso!`);
        
        // Disparar evento para atualizar UI
        window.dispatchEvent(new CustomEvent('syncComplete', { 
          detail: result 
        }));
      }
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    }
  });
}

