/**
 * Sistema de fila para operações offline
 * Gerencia operações que precisam ser sincronizadas quando voltar online
 */

export interface QueueOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
  metadata?: {
    userId?: string;
    description?: string;
    category?: string;
  };
}

export interface QueueStats {
  total: number;
  pending: number;
  failed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  oldestOperation: number;
  newestOperation: number;
}

class OfflineQueue {
  private static instance: OfflineQueue;
  private db: IDBDatabase | null = null;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  /**
   * Inicializa o sistema de fila
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('7care-offline-queue', 1);

      request.onerror = () => {
        console.error('❌ Erro ao abrir fila offline:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Fila offline inicializada');
        
        // Iniciar processamento automático
        this.startAutoProcessing();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('queue')) {
          const store = db.createObjectStore('queue', { keyPath: 'id' });
          
          // Índices para consultas eficientes
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('endpoint', 'endpoint', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  /**
   * Adiciona operação à fila
   */
  async addOperation(operation: Omit<QueueOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.db) {
      throw new Error('Fila offline não está inicializada');
    }

    const id = this.generateOperationId();
    const queueOperation: QueueOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: operation.maxRetries || 3
    };

    const transaction = this.db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');

    return new Promise((resolve, reject) => {
      const request = store.add(queueOperation);

      request.onsuccess = () => {
        console.log(`📝 Operação adicionada à fila: ${queueOperation.type} ${queueOperation.endpoint}`);
        
        // Se online, tentar processar imediatamente
        if (navigator.onLine) {
          this.processQueue();
        }
        
        resolve(id);
      };

      request.onerror = () => {
        console.error('❌ Erro ao adicionar operação à fila:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Remove operação da fila
   */
  async removeOperation(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ Operação removida da fila: ${id}`);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao remover operação da fila:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Atualiza operação na fila
   */
  async updateOperation(id: string, updates: Partial<QueueOperation>): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (!operation) {
          reject(new Error('Operação não encontrada'));
          return;
        }

        const updatedOperation = { ...operation, ...updates };
        const putRequest = store.put(updatedOperation);

        putRequest.onsuccess = () => {
          console.log(`📝 Operação atualizada na fila: ${id}`);
          resolve();
        };

        putRequest.onerror = () => {
          console.error('❌ Erro ao atualizar operação:', putRequest.error);
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('❌ Erro ao buscar operação:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  /**
   * Obtém todas as operações pendentes
   */
  async getPendingOperations(): Promise<QueueOperation[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['queue'], 'readonly');
    const store = transaction.objectStore('queue');

    return new Promise((resolve) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const operations = request.result || [];
        // Ordenar por prioridade e timestamp
        operations.sort((a, b) => {
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 2;
          const bPriority = priorityOrder[b.priority] || 2;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return a.timestamp - b.timestamp;
        });
        
        resolve(operations);
      };

      request.onerror = () => {
        console.error('❌ Erro ao buscar operações:', request.error);
        resolve([]);
      };
    });
  }

  /**
   * Obtém estatísticas da fila
   */
  async getQueueStats(): Promise<QueueStats> {
    if (!this.db) {
      return {
        total: 0,
        pending: 0,
        failed: 0,
        byType: {},
        byPriority: {},
        oldestOperation: 0,
        newestOperation: 0
      };
    }

    const operations = await this.getPendingOperations();
    
    const stats: QueueStats = {
      total: operations.length,
      pending: operations.filter(op => op.retryCount === 0).length,
      failed: operations.filter(op => op.retryCount >= op.maxRetries).length,
      byType: {},
      byPriority: {},
      oldestOperation: operations.length > 0 ? Math.min(...operations.map(op => op.timestamp)) : 0,
      newestOperation: operations.length > 0 ? Math.max(...operations.map(op => op.timestamp)) : 0
    };

    // Contar por tipo
    operations.forEach(op => {
      stats.byType[op.type] = (stats.byType[op.type] || 0) + 1;
      stats.byPriority[op.priority] = (stats.byPriority[op.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * Processa a fila de operações
   */
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (!this.db || this.isProcessing || !navigator.onLine) {
      return { success: 0, failed: 0 };
    }

    this.isProcessing = true;
    const operations = await this.getPendingOperations();
    let success = 0;
    let failed = 0;

    console.log(`🔄 Processando ${operations.length} operações da fila...`);

    for (const operation of operations) {
      try {
        const result = await this.executeOperation(operation);
        
        if (result.success) {
          await this.removeOperation(operation.id);
          success++;
          console.log(`✅ Operação executada: ${operation.type} ${operation.endpoint}`);
        } else {
          await this.handleOperationFailure(operation, result.error);
          failed++;
          console.log(`❌ Operação falhou: ${operation.type} ${operation.endpoint}`);
        }
      } catch (error) {
        await this.handleOperationFailure(operation, error);
        failed++;
        console.error(`❌ Erro ao executar operação: ${operation.type} ${operation.endpoint}`, error);
      }
    }

    this.isProcessing = false;
    console.log(`📊 Fila processada: ${success} sucessos, ${failed} falhas`);
    
    return { success, failed };
  }

  /**
   * Executa uma operação específica
   */
  private async executeOperation(operation: QueueOperation): Promise<{ success: boolean; error?: any }> {
    try {
      const options: RequestInit = {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json',
          ...operation.headers
        }
      };

      if (operation.data && ['POST', 'PUT'].includes(operation.method)) {
        options.body = JSON.stringify(operation.data);
      }

      const response = await fetch(operation.endpoint, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Trata falha de operação
   */
  private async handleOperationFailure(operation: QueueOperation, error: any): Promise<void> {
    const newRetryCount = operation.retryCount + 1;
    
    if (newRetryCount >= operation.maxRetries) {
      // Máximo de tentativas atingido, remover da fila
      await this.removeOperation(operation.id);
      console.log(`🚫 Operação removida após ${operation.maxRetries} tentativas: ${operation.id}`);
    } else {
      // Incrementar contador de tentativas
      await this.updateOperation(operation.id, { retryCount: newRetryCount });
      console.log(`🔄 Operação reagendada (tentativa ${newRetryCount}/${operation.maxRetries}): ${operation.id}`);
    }
  }

  /**
   * Inicia processamento automático da fila
   */
  private startAutoProcessing(): void {
    // Processar a cada 30 segundos quando online
    this.processingInterval = setInterval(() => {
      if (navigator.onLine && !this.isProcessing) {
        this.processQueue();
      }
    }, 30000);

    // Processar quando voltar online
    window.addEventListener('online', () => {
      console.log('🌐 Conectividade restaurada, processando fila...');
      this.processQueue();
    });
  }

  /**
   * Para o processamento automático
   */
  stopAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Limpa toda a fila
   */
  async clearQueue(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Fila offline limpa');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao limpar fila:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Gera ID único para operação
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Instância singleton
export const offlineQueue = OfflineQueue.getInstance();
