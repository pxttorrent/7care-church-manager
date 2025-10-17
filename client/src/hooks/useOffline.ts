/**
 * Hook para gerenciar funcionalidades offline
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineDB } from '@/lib/offlineDatabase';
import { offlineQueue, QueueOperation, QueueStats } from '@/lib/offlineQueue';

export interface OfflineStatus {
  isOnline: boolean;
  isInitialized: boolean;
  cacheStats: {
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
  };
  queueStats: QueueStats;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isInitialized: false,
    cacheStats: {
      totalItems: 0,
      totalSize: 0,
      oldestItem: 0,
      newestItem: 0
    },
    queueStats: {
      total: 0,
      pending: 0,
      failed: 0,
      byType: {},
      byPriority: {},
      oldestOperation: 0,
      newestOperation: 0
    }
  });

  // Inicializar sistema offline
  useEffect(() => {
    const initializeOfflineSystem = async () => {
      try {
        await offlineDB.initialize();
        await offlineQueue.initialize();
        
        const cacheStats = await offlineDB.getCacheStats();
        const queueStats = await offlineQueue.getQueueStats();
        
        setStatus(prev => ({
          ...prev,
          isInitialized: true,
          cacheStats,
          queueStats
        }));
        
        console.log('✅ Sistema offline inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar sistema offline:', error);
      }
    };

    initializeOfflineSystem();
  }, []);

  // Detectar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      console.log('🌐 Conectividade restaurada');
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      console.log('📱 Modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Função para buscar dados com fallback offline
  const fetchWithOfflineFallback = useCallback(async (
    endpoint: string,
    options?: RequestInit,
    maxCacheAge?: number
  ) => {
    const isOnline = navigator.onLine;
    
    try {
      // Se online, fazer requisição normal
      if (isOnline) {
        const response = await fetch(endpoint, options);
        
        if (response.ok) {
          const data = await response.json();
          
          // Salvar no cache para uso offline
          await offlineDB.cacheData(endpoint, data, response.headers.get('etag'));
          
          return {
            data,
            fromCache: false,
            isOnline: true
          };
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } else {
        // Se offline, usar cache
        const cachedData = await offlineDB.getCachedData(endpoint, maxCacheAge);
        
        if (cachedData) {
          return {
            data: cachedData,
            fromCache: true,
            isOnline: false
          };
        } else {
          throw new Error('Dados não disponíveis offline');
        }
      }
    } catch (error) {
      // Em caso de erro online, tentar cache como fallback
      if (isOnline) {
        const cachedData = await offlineDB.getCachedData(endpoint, maxCacheAge);
        
        if (cachedData) {
          console.warn('⚠️ Usando cache devido a erro online:', error);
          return {
            data: cachedData,
            fromCache: true,
            isOnline: false
          };
        }
      }
      
      throw error;
    }
  }, []);

  // Função para limpar cache
  const clearCache = useCallback(async () => {
    try {
      await offlineDB.cleanupOldCache(0); // Remove tudo
      
      // Atualizar estatísticas
      const cacheStats = await offlineDB.getCacheStats();
      setStatus(prev => ({ ...prev, cacheStats }));
      
      console.log('✅ Cache limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }, []);

  // Função para atualizar estatísticas
  const updateStats = useCallback(async () => {
    try {
      const cacheStats = await offlineDB.getCacheStats();
      const queueStats = await offlineQueue.getQueueStats();
      setStatus(prev => ({ ...prev, cacheStats, queueStats }));
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    }
  }, []);

  // Função para adicionar operação à fila
  const addToQueue = useCallback(async (operation: Omit<QueueOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    try {
      const id = await offlineQueue.addOperation(operation);
      await updateStats();
      return id;
    } catch (error) {
      console.error('❌ Erro ao adicionar à fila:', error);
      throw error;
    }
  }, [updateStats]);

  // Função para processar fila manualmente
  const processQueue = useCallback(async () => {
    try {
      const result = await offlineQueue.processQueue();
      await updateStats();
      return result;
    } catch (error) {
      console.error('❌ Erro ao processar fila:', error);
      throw error;
    }
  }, [updateStats]);

  // Função para limpar fila
  const clearQueue = useCallback(async () => {
    try {
      await offlineQueue.clearQueue();
      await updateStats();
      console.log('✅ Fila limpa com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar fila:', error);
    }
  }, [updateStats]);

  // Função para obter operações pendentes
  const getPendingOperations = useCallback(async () => {
    try {
      return await offlineQueue.getPendingOperations();
    } catch (error) {
      console.error('❌ Erro ao buscar operações:', error);
      return [];
    }
  }, []);

  return {
    ...status,
    fetchWithOfflineFallback,
    clearCache,
    updateStats,
    // Funções da fila
    addToQueue,
    processQueue,
    clearQueue,
    getPendingOperations,
    // Funções diretas do banco
    cacheData: offlineDB.cacheData.bind(offlineDB),
    getCachedData: offlineDB.getCachedData.bind(offlineDB),
    removeCachedData: offlineDB.removeCachedData.bind(offlineDB)
  };
};
