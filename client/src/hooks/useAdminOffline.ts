/**
 * Hook para gerenciar sistema offline exclusivo para admins
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { offlineDB } from '@/lib/offlineDatabase';
import { offlineQueue } from '@/lib/offlineQueue';
import { offlineSync } from '@/lib/offlineSync';
import { offlineInterceptor } from '@/lib/offlineInterceptor';
import { precacheCriticalAssets, getCacheStats } from '@/lib/precacheAssets';
import { backgroundSyncService } from '@/lib/backgroundSync';

interface AdminOfflineStatus {
  isAdmin: boolean;
  isOfflineEnabled: boolean;
  isInitialized: boolean;
  isPrecaching: boolean;
  precacheProgress: number;
  cacheStats: {
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
  };
  swCacheStats: {
    totalAssets: number;
    cachedAssets: number;
    cachePercentage: number;
    cacheNames: string[];
    assetsByCache: Record<string, number>;
  };
}

export const useAdminOffline = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AdminOfflineStatus>({
    isAdmin: false,
    isOfflineEnabled: false,
    isInitialized: false,
    isPrecaching: false,
    precacheProgress: 0,
    cacheStats: {
      totalItems: 0,
      totalSize: 0,
      oldestItem: 0,
      newestItem: 0
    },
    swCacheStats: {
      totalAssets: 0,
      cachedAssets: 0,
      cachePercentage: 0,
      cacheNames: [],
      assetsByCache: {}
    }
  });

  // Verificar se o usuário é admin
  const checkIfAdmin = useCallback(() => {
    const isAdmin = user?.role === 'admin' || user?.role === 'administrator';
    setStatus(prev => ({ ...prev, isAdmin }));
    return isAdmin;
  }, [user?.role]);

  // Inicializar sistema offline apenas para admins
  const initializeOfflineSystem = useCallback(async () => {
    if (!checkIfAdmin()) {
      console.log('🚫 Sistema offline desabilitado: usuário não é admin');
      setStatus(prev => ({ ...prev, isOfflineEnabled: false, isInitialized: true }));
      return;
    }

    try {
      console.log('🔧 Inicializando sistema offline para admin...');
      
      // Inicializar componentes do sistema offline
      await offlineDB.initialize();
      await offlineQueue.initialize();
      await offlineSync.initialize();
      await offlineInterceptor.initialize();

      // Ativar interceptador automaticamente para admins
      offlineInterceptor.enable();

      // Registrar background sync para admins
      if (backgroundSyncService.isSupported()) {
        await backgroundSyncService.registerGeneralSync();
      }

      // Obter estatísticas
      const cacheStats = await offlineDB.getCacheStats();
      const swCacheStats = await getCacheStats();

      setStatus(prev => ({
        ...prev,
        isOfflineEnabled: true,
        isInitialized: true,
        cacheStats,
        swCacheStats
      }));

      console.log('✅ Sistema offline inicializado para admin');
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema offline:', error);
      setStatus(prev => ({ ...prev, isInitialized: true }));
    }
  }, [checkIfAdmin]);

  // Pré-cachear todos os dados e páginas para admins
  const precacheAllAdminData = useCallback(async () => {
    if (!status.isAdmin || !status.isOfflineEnabled) {
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isPrecaching: true, precacheProgress: 0 }));

      // Etapa 1: Pré-cachear assets críticos (20%)
      console.log('📦 Etapa 1/5: Pré-cacheando assets críticos...');
      await precacheCriticalAssets();
      setStatus(prev => ({ ...prev, precacheProgress: 20 }));

      // Etapa 2: Cachear dados de usuários (40%)
      console.log('👥 Etapa 2/5: Cacheando dados de usuários...');
      await cacheUsersData();
      setStatus(prev => ({ ...prev, precacheProgress: 40 }));

      // Etapa 3: Cachear dados de calendário (60%)
      console.log('📅 Etapa 3/5: Cacheando dados de calendário...');
      await cacheCalendarData();
      setStatus(prev => ({ ...prev, precacheProgress: 60 }));

      // Etapa 4: Cachear dados de tarefas (80%)
      console.log('📋 Etapa 4/5: Cacheando dados de tarefas...');
      await cacheTasksData();
      setStatus(prev => ({ ...prev, precacheProgress: 80 }));

      // Etapa 5: Cachear dados de gamificação (100%)
      console.log('🎮 Etapa 5/5: Cacheando dados de gamificação...');
      await cacheGamificationData();
      setStatus(prev => ({ ...prev, precacheProgress: 100 }));

      // Atualizar estatísticas finais
      const finalCacheStats = await offlineDB.getCacheStats();
      const finalSwCacheStats = await getCacheStats();

      setStatus(prev => ({
        ...prev,
        isPrecaching: false,
        cacheStats: finalCacheStats,
        swCacheStats: finalSwCacheStats
      }));

      console.log('✅ Pré-cache completo para admin concluído!');
    } catch (error) {
      console.error('❌ Erro no pré-cache:', error);
      setStatus(prev => ({ ...prev, isPrecaching: false }));
    }
  }, [status.isAdmin, status.isOfflineEnabled]);

  // Funções para cachear dados específicos
  const cacheUsersData = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        await offlineDB.cacheData('/api/users', data);
        console.log('✅ Dados de usuários cacheados');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de usuários:', error);
    }
  };

  const cacheCalendarData = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        await offlineDB.cacheData('/api/calendar/events', data);
        console.log('✅ Dados de calendário cacheados');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de calendário:', error);
    }
  };

  const cacheTasksData = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        await offlineDB.cacheData('/api/tasks', data);
        console.log('✅ Dados de tarefas cacheados');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de tarefas:', error);
    }
  };

  const cacheGamificationData = async () => {
    try {
      const response = await fetch('/api/gamification/points');
      if (response.ok) {
        const data = await response.json();
        await offlineDB.cacheData('/api/gamification/points', data);
        console.log('✅ Dados de gamificação cacheados');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de gamificação:', error);
    }
  };

  // Desabilitar sistema offline para não-admins
  const disableOfflineForNonAdmin = useCallback(async () => {
    if (status.isAdmin) return;

    try {
      offlineInterceptor.disable();
      await offlineSync.stop();
      console.log('🚫 Sistema offline desabilitado para usuário não-admin');
    } catch (error) {
      console.error('❌ Erro ao desabilitar sistema offline:', error);
    }
  }, [status.isAdmin]);

  // Efeitos
  useEffect(() => {
    if (user) {
      initializeOfflineSystem();
    } else {
      setStatus(prev => ({ ...prev, isInitialized: true }));
    }
  }, [user, initializeOfflineSystem]);

  useEffect(() => {
    if (status.isInitialized && status.isAdmin && status.isOfflineEnabled) {
      // Pré-cachear automaticamente após login do admin
      const timer = setTimeout(() => {
        precacheAllAdminData();
      }, 2000); // Aguardar 2 segundos após login

      return () => clearTimeout(timer);
    } else if (status.isInitialized && !status.isAdmin) {
      disableOfflineForNonAdmin();
    }
  }, [status.isInitialized, status.isAdmin, status.isOfflineEnabled, precacheAllAdminData, disableOfflineForNonAdmin]);

  return {
    ...status,
    precacheAllAdminData,
    initializeOfflineSystem,
    disableOfflineForNonAdmin
  };
};
