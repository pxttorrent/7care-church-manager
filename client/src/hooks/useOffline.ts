/**
 * Hook para gerenciar funcionalidades offline
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineDB } from '@/lib/offlineDatabase';

export interface OfflineStatus {
  isOnline: boolean;
  isInitialized: boolean;
  cacheStats: {
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
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
    }
  });

  // Inicializar banco offline
  useEffect(() => {
    const initializeOfflineDB = async () => {
      try {
        await offlineDB.initialize();
        const cacheStats = await offlineDB.getCacheStats();
        
        setStatus(prev => ({
          ...prev,
          isInitialized: true,
          cacheStats
        }));
        
        console.log('✅ Sistema offline inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar sistema offline:', error);
      }
    };

    initializeOfflineDB();
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
  const updateCacheStats = useCallback(async () => {
    try {
      const cacheStats = await offlineDB.getCacheStats();
      setStatus(prev => ({ ...prev, cacheStats }));
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    }
  }, []);

  return {
    ...status,
    fetchWithOfflineFallback,
    clearCache,
    updateCacheStats,
    // Funções diretas do banco
    cacheData: offlineDB.cacheData.bind(offlineDB),
    getCachedData: offlineDB.getCachedData.bind(offlineDB),
    removeCachedData: offlineDB.removeCachedData.bind(offlineDB)
  };
};
