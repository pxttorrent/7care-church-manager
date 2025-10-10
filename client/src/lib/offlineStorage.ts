/**
 * 📦 OFFLINE STORAGE - Sistema de Armazenamento Local com IndexedDB
 * 
 * Este módulo fornece uma camada de armazenamento offline-first usando IndexedDB.
 * Permite criar, ler, atualizar e deletar dados localmente, com sincronização automática ao conectar.
 */

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  storeName: string;
  endpoint: string;
  data: any;
  originalUpdates?: any; // ← Apenas campos alterados (para UPDATE)
  timestamp: string;
  attempts: number;
  status: 'pending' | 'syncing' | 'error';
}

export interface StorageMetadata {
  key: string;
  value: any;
  updated_at?: string;
}

interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique?: boolean }[];
}

// ========================================
// CONFIGURAÇÃO DO BANCO
// ========================================

const DB_NAME = '7care-offline-db';
const DB_VERSION = 1;

const STORES: StoreConfig[] = [
  {
    name: 'tasks',
    keyPath: 'id',
    indexes: [
      { name: 'status', keyPath: 'status' },
      { name: 'priority', keyPath: 'priority' },
      { name: 'created_by', keyPath: 'created_by' }
    ]
  },
  {
    name: 'users',
    keyPath: 'id',
    indexes: [
      { name: 'email', keyPath: 'email', unique: true }
    ]
  },
  {
    name: 'sync_queue',
    keyPath: 'id',
    indexes: [
      { name: 'timestamp', keyPath: 'timestamp' },
      { name: 'status', keyPath: 'status' }
    ]
  },
  {
    name: 'metadata',
    keyPath: 'key'
  }
];

// ========================================
// CLASSE PRINCIPAL
// ========================================

export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Inicializar o banco de dados IndexedDB
   */
  async init(): Promise<void> {
    // Se já está inicializando, retornar a promise existente
    if (this.initPromise) return this.initPromise;

    // Se já está inicializado, retornar
    if (this.db) return Promise.resolve();

    this.initPromise = new Promise((resolve, reject) => {
      console.log(`📦 Inicializando ${DB_NAME} v${DB_VERSION}...`);
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ OfflineStorage inicializado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        console.log('🔨 Atualizando estrutura do banco...');

        // Criar ou atualizar stores
        STORES.forEach(storeConfig => {
          // Deletar store antigo se existir (para recriar com nova estrutura)
          if (db.objectStoreNames.contains(storeConfig.name)) {
            db.deleteObjectStore(storeConfig.name);
            console.log(`🗑️ Store "${storeConfig.name}" deletado para recriação`);
          }

          // Criar store
          const store = db.createObjectStore(storeConfig.name, {
            keyPath: storeConfig.keyPath
          });

          // Criar índices
          storeConfig.indexes?.forEach(index => {
            store.createIndex(index.name, index.keyPath, { 
              unique: index.unique || false 
            });
          });

          console.log(`✅ Store "${storeConfig.name}" criado`);
        });
      };
    });

    return this.initPromise;
  }

  /**
   * Garantir que o DB está inicializado antes de usar
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Banco de dados não inicializado');
    }
    return this.db;
  }

  // ========================================
  // OPERAÇÕES CRUD GENÉRICAS
  // ========================================

  /**
   * Buscar todos os itens de um store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        console.log(`📖 ${storeName}: ${items.length} itens recuperados`);
        resolve(items);
      };

      request.onerror = () => {
        console.error(`❌ Erro ao buscar ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Buscar um item por ID
   */
  async getById<T>(storeName: string, id: any): Promise<T | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`❌ Erro ao buscar ${storeName}#${id}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Salvar ou atualizar um item
   */
  async save<T extends { id: any }>(storeName: string, data: T): Promise<T> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Adicionar metadados de modificação local
      const dataWithMeta = {
        ...data,
        _localModified: new Date().toISOString(),
        _synced: false
      };

      const request = store.put(dataWithMeta);

      request.onsuccess = () => {
        console.log(`💾 ${storeName}#${data.id} salvo localmente`);
        resolve(dataWithMeta as T);
      };

      request.onerror = () => {
        console.error(`❌ Erro ao salvar ${storeName}#${data.id}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Deletar um item
   */
  async delete(storeName: string, id: any): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ ${storeName}#${id} deletado localmente`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Erro ao deletar ${storeName}#${id}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpar todos os itens de um store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`🧹 ${storeName} limpo`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Erro ao limpar ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // ========================================
  // FILA DE SINCRONIZAÇÃO
  // ========================================

  /**
   * Adicionar operação à fila de sincronização
   */
  async addToSyncQueue(operation: Omit<SyncQueueItem, 'id' | 'timestamp' | 'attempts' | 'status'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...operation,
      timestamp: new Date().toISOString(),
      attempts: 0,
      status: 'pending'
    };

    await this.save('sync_queue', queueItem);
    console.log('📝 Adicionado à fila:', queueItem.type, queueItem.endpoint);
  }

  /**
   * Buscar itens pendentes na fila
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>('sync_queue');
  }

  /**
   * Remover item da fila após sincronização bem-sucedida
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    await this.delete('sync_queue', id);
  }

  /**
   * Atualizar status de item na fila
   */
  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const item = await this.getById<SyncQueueItem>('sync_queue', id);
    if (item) {
      await this.save('sync_queue', { ...item, ...updates });
    }
  }

  // ========================================
  // SINCRONIZAÇÃO COM SERVIDOR
  // ========================================

  /**
   * Sincronizar fila com servidor
   */
  async syncWithServer(): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!navigator.onLine) {
      console.log('⚠️ Offline - sincronização adiada');
      return { success: 0, failed: 0, errors: ['Dispositivo offline'] };
    }

    console.log('🔄 Iniciando sincronização com servidor...');
    
    const queue = await this.getSyncQueue();
    const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'error');
    
    if (pendingItems.length === 0) {
      console.log('✅ Nenhum item pendente para sincronizar');
      return { success: 0, failed: 0, errors: [] };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    console.log(`📦 ${pendingItems.length} itens para sincronizar`);

    for (const item of pendingItems) {
      try {
        // Marcar como sincronizando
        await this.updateSyncQueueItem(item.id, { 
          status: 'syncing',
          attempts: item.attempts + 1
        });

        let response;
        
        switch (item.type) {
          case 'CREATE':
            response = await fetch(item.endpoint, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-user-id': '1' // TODO: Pegar do contexto de autenticação
              },
              body: JSON.stringify(item.data)
            });
            break;
            
          case 'UPDATE':
            // Usar apenas os campos alterados (originalUpdates), não o objeto completo
            const updatePayload = item.originalUpdates || item.data;
            
            response = await fetch(`${item.endpoint}/${item.data.id}`, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'x-user-id': '1'
              },
              body: JSON.stringify(updatePayload)
            });
            console.log(`📤 Enviando UPDATE para ${item.endpoint}/${item.data.id}:`, updatePayload);
            break;
            
          case 'DELETE':
            response = await fetch(`${item.endpoint}/${item.data.id}`, {
              method: 'DELETE',
              headers: { 'x-user-id': '1' }
            });
            break;
        }

        if (response && response.ok) {
          // Sucesso - remover da fila
          await this.removeFromSyncQueue(item.id);
          
          // Se foi CREATE ou UPDATE, atualizar o item local com dados do servidor
          if (item.type !== 'DELETE' && response.headers.get('content-type')?.includes('application/json')) {
            try {
              const serverData = await response.json();
              const actualData = serverData.task || serverData; // Lidar com { task: {...} }
              
              if (actualData && actualData.id) {
                await this.save(item.storeName, {
                  ...actualData,
                  _synced: true
                });
                console.log(`✅ ${item.type} sincronizado e atualizado: ${item.storeName}#${actualData.id}`);
              }
            } catch (e) {
              console.warn('⚠️ Não foi possível parsear resposta do servidor:', e);
            }
          }
          
          success++;
          console.log(`✅ Sincronizado: ${item.type} ${item.endpoint}`);
        } else {
          // Falha - marcar como erro
          failed++;
          const errorMsg = `HTTP ${response?.status}: ${item.type} ${item.endpoint}`;
          errors.push(errorMsg);
          
          await this.updateSyncQueueItem(item.id, { 
            status: 'error'
          });
          
          console.error(`❌ Falha na sincronização:`, errorMsg);
        }
        
      } catch (error: any) {
        failed++;
        const errorMsg = `${item.type} ${item.endpoint}: ${error.message}`;
        errors.push(errorMsg);
        
        await this.updateSyncQueueItem(item.id, { 
          status: 'error'
        });
        
        console.error(`❌ Erro ao sincronizar:`, error);
      }
    }

    // Atualizar metadata de última sincronização
    await this.save('metadata', {
      key: 'last_sync',
      value: new Date().toISOString()
    });

    console.log(`🔄 Sincronização concluída: ✅ ${success} sucesso, ❌ ${failed} falhas`);
    return { success, failed, errors };
  }

  // ========================================
  // INFORMAÇÕES E UTILITÁRIOS
  // ========================================

  /**
   * Buscar informações sobre sincronização
   */
  async getSyncInfo(): Promise<{
    lastSync: string | null;
    pendingCount: number;
    errorCount: number;
  }> {
    const lastSyncMeta = await this.getById<StorageMetadata>('metadata', 'last_sync');
    const queue = await this.getSyncQueue();
    
    const pendingCount = queue.filter(item => item.status === 'pending').length;
    const errorCount = queue.filter(item => item.status === 'error').length;

    return {
      lastSync: lastSyncMeta?.value || null,
      pendingCount,
      errorCount
    };
  }

  /**
   * Limpar toda a fila de sincronização (usar com cuidado!)
   */
  async clearSyncQueue(): Promise<void> {
    await this.clear('sync_queue');
    console.log('🧹 Fila de sincronização limpa');
  }
}

// ========================================
// SINGLETON EXPORTADO
// ========================================

export const offlineStorage = new OfflineStorage();

// ========================================
// AUTO-SYNC AO CONECTAR
// ========================================

if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('🌐 Conexão restaurada! Iniciando sincronização automática...');
    
    try {
      const result = await offlineStorage.syncWithServer();
      
      if (result.success > 0) {
        console.log(`✅ ${result.success} item(ns) sincronizado(s) com sucesso!`);
        
        // Disparar evento para atualizar UI
        window.dispatchEvent(new CustomEvent('syncComplete', { 
          detail: result 
        }));
      }
      
      if (result.failed > 0) {
        console.error(`❌ ${result.failed} item(ns) falharam na sincronização`);
        console.error('Erros:', result.errors);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    }
  });
}
