/**
 * Hook para gerenciar funcionalidades offline
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineDB } from '@/lib/offlineDatabase';
import { offlineQueue, QueueOperation, QueueStats } from '@/lib/offlineQueue';
import { offlineSync, SyncConfig, SyncStats, SyncEvent } from '@/lib/offlineSync';
import { backgroundSyncService, SyncRegistration } from '@/lib/backgroundSync';
import { offlineInterceptor } from '@/lib/offlineInterceptor';
import { precacheCriticalAssets, checkCacheStatus, getCacheStats } from '@/lib/precacheAssets';

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
  syncStats: SyncStats;
  syncConfig: SyncConfig;
  isSyncActive: boolean;
  backgroundSyncSupported: boolean;
  backgroundSyncRegistrations: SyncRegistration[];
  interceptorEnabled: boolean;
  swCacheStats: {
    totalAssets: number;
    cachedAssets: number;
    cachePercentage: number;
    cacheNames: string[];
    assetsByCache: Record<string, number>;
  };
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
    },
    syncStats: {
      lastSync: 0,
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      pendingOperations: 0,
      batteryLevel: 100,
      connectionType: 'unknown'
    },
    syncConfig: {
      enabled: true,
      interval: 30000,
      batteryThreshold: 20,
      wifiOnly: false,
      maxRetries: 3,
      retryDelay: 5000,
      priorityEndpoints: [],
      blacklistedEndpoints: []
    },
    isSyncActive: false,
    backgroundSyncSupported: backgroundSyncService.isSupported(),
    backgroundSyncRegistrations: [],
    interceptorEnabled: false,
    swCacheStats: {
      totalAssets: 0,
      cachedAssets: 0,
      cachePercentage: 0,
      cacheNames: [],
      assetsByCache: {}
    }
  });

  // Inicializar sistema offline
  useEffect(() => {
        const initializeOfflineSystem = async () => {
          try {
            await offlineDB.initialize();
            await offlineQueue.initialize();
            await offlineSync.initialize();
            
            // Inicializar interceptador global
            await offlineInterceptor.initialize();
            
            // Pré-cachear assets críticos
            try {
              await precacheCriticalAssets();
            } catch (error) {
              console.warn('⚠️ Erro ao pré-cachear assets:', error);
            }
            
            const cacheStats = await offlineDB.getCacheStats();
            const queueStats = await offlineQueue.getQueueStats();
            const syncStats = offlineSync.getStats();
            const syncConfig = offlineSync.getConfig();
            const interceptorStats = await offlineInterceptor.getStats();
            const swCacheStats = await getCacheStats();
            
            setStatus(prev => ({
              ...prev,
              isInitialized: true,
              cacheStats,
              queueStats,
              syncStats,
              syncConfig,
              isSyncActive: offlineSync.isActive(),
              interceptorEnabled: interceptorStats.config.enabled,
              swCacheStats
            }));
            
            console.log('✅ Sistema offline completo inicializado');
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

  // Funções de sincronização
  const startSync = useCallback(async () => {
    try {
      await offlineSync.start();
      setStatus(prev => ({ ...prev, isSyncActive: true }));
    } catch (error) {
      console.error('❌ Erro ao iniciar sincronização:', error);
    }
  }, []);

  const stopSync = useCallback(() => {
    try {
      offlineSync.stop();
      setStatus(prev => ({ ...prev, isSyncActive: false }));
    } catch (error) {
      console.error('❌ Erro ao parar sincronização:', error);
    }
  }, []);

  const syncNow = useCallback(async () => {
    try {
      const result = await offlineSync.syncNow();
      await updateStats();
      return result;
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
      throw error;
    }
  }, [updateStats]);

  const updateSyncConfig = useCallback((newConfig: Partial<SyncConfig>) => {
    try {
      offlineSync.updateConfig(newConfig);
      const updatedConfig = offlineSync.getConfig();
      setStatus(prev => ({ ...prev, syncConfig: updatedConfig }));
    } catch (error) {
      console.error('❌ Erro ao atualizar configuração:', error);
    }
  }, []);

  // Funções de Background Sync
  const registerBackgroundSync = useCallback(async (type?: 'users' | 'tasks' | 'calendar') => {
    try {
      let success = false;
      
      if (type) {
        success = await backgroundSyncService.registerTypeSync(type);
      } else {
        success = await backgroundSyncService.registerGeneralSync();
      }
      
      if (success) {
        // Atualizar registros
        const registrations = backgroundSyncService.getRegistrationStatus();
        setStatus(prev => ({ ...prev, backgroundSyncRegistrations: registrations }));
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao registrar Background Sync:', error);
      return false;
    }
  }, []);

  const forceBackgroundSync = useCallback(async () => {
    try {
      const success = await backgroundSyncService.forceSync();
      
      if (success) {
        // Atualizar registros
        const registrations = backgroundSyncService.getRegistrationStatus();
        setStatus(prev => ({ ...prev, backgroundSyncRegistrations: registrations }));
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao forçar Background Sync:', error);
      return false;
    }
  }, []);

  // Funções do Interceptador
  const enableInterceptor = useCallback(() => {
    try {
      offlineInterceptor.enable();
      setStatus(prev => ({ ...prev, interceptorEnabled: true }));
      console.log('✅ Interceptador habilitado');
    } catch (error) {
      console.error('❌ Erro ao habilitar interceptador:', error);
    }
  }, []);

  const disableInterceptor = useCallback(() => {
    try {
      offlineInterceptor.disable();
      setStatus(prev => ({ ...prev, interceptorEnabled: false }));
      console.log('🔴 Interceptador desabilitado');
    } catch (error) {
      console.error('❌ Erro ao desabilitar interceptador:', error);
    }
  }, []);

  const clearEndpointCache = useCallback(async (endpoint: string) => {
    try {
      await offlineInterceptor.clearCacheForEndpoint(endpoint);
      await updateStats();
      console.log(`✅ Cache limpo para endpoint: ${endpoint}`);
    } catch (error) {
      console.error('❌ Erro ao limpar cache do endpoint:', error);
    }
  }, [updateStats]);

  const clearAllInterceptorCache = useCallback(async () => {
    try {
      await offlineInterceptor.clearAllCache();
      await updateStats();
      console.log('✅ Todo o cache do interceptador foi limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar todo o cache:', error);
    }
  }, [updateStats]);

  // Função para pré-cachear assets críticos
  const precacheAssets = useCallback(async () => {
    try {
      await precacheCriticalAssets();
      const swCacheStats = await getCacheStats();
      setStatus(prev => ({ ...prev, swCacheStats }));
      console.log('✅ Assets críticos pré-cacheados');
    } catch (error) {
      console.error('❌ Erro ao pré-cachear assets:', error);
      throw error;
    }
  }, []);

  // Listener para eventos de sincronização
  useEffect(() => {
    const handleSyncEvent = (event: SyncEvent) => {
      const syncStats = offlineSync.getStats();
      const isSyncActive = offlineSync.isActive();
      
      setStatus(prev => ({
        ...prev,
        syncStats,
        isSyncActive
      }));
    };

    offlineSync.addEventListener(handleSyncEvent);

    return () => {
      offlineSync.removeEventListener(handleSyncEvent);
    };
  }, []);

  // Listener para eventos de Background Sync
  useEffect(() => {
    const handleBackgroundSyncCompleted = (event: CustomEvent) => {
      console.log('✅ Background Sync concluído:', event.detail);
      
      // Atualizar estatísticas
      updateStats();
      
      // Atualizar registros
      const registrations = backgroundSyncService.getRegistrationStatus();
      setStatus(prev => ({ ...prev, backgroundSyncRegistrations: registrations }));
    };

    const handleBackgroundSyncError = (event: CustomEvent) => {
      console.error('❌ Background Sync falhou:', event.detail);
      
      // Atualizar registros
      const registrations = backgroundSyncService.getRegistrationStatus();
      setStatus(prev => ({ ...prev, backgroundSyncRegistrations: registrations }));
    };

    window.addEventListener('background-sync-completed', handleBackgroundSyncCompleted as EventListener);
    window.addEventListener('background-sync-error', handleBackgroundSyncError as EventListener);

    return () => {
      window.removeEventListener('background-sync-completed', handleBackgroundSyncCompleted as EventListener);
      window.removeEventListener('background-sync-error', handleBackgroundSyncError as EventListener);
    };
  }, [updateStats]);

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
    // Funções de sincronização
    startSync,
    stopSync,
    syncNow,
    updateSyncConfig,
    // Funções de Background Sync
    registerBackgroundSync,
    forceBackgroundSync,
    // Funções do Interceptador
    enableInterceptor,
    disableInterceptor,
    clearEndpointCache,
    clearAllInterceptorCache,
    // Funções de pré-cache
    precacheAssets,
    // Funções diretas do banco
    cacheData: offlineDB.cacheData.bind(offlineDB),
    getCachedData: offlineDB.getCachedData.bind(offlineDB),
    removeCachedData: offlineDB.removeCachedData.bind(offlineDB)
  };
};
