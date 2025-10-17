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

      console.log('🚀 Iniciando pré-cache automático para admin...');
      console.log('ℹ️ Nota: Erros 404 são normais - sistema tenta diferentes endpoints até encontrar os válidos');

      // Etapa 1: Pré-cachear assets críticos (16%)
      console.log('📦 Etapa 1/6: Pré-cacheando assets críticos...');
      await precacheCriticalAssets();
      setStatus(prev => ({ ...prev, precacheProgress: 16 }));

      // Etapa 2: Cachear dados de usuários (33%)
      console.log('👥 Etapa 2/6: Cacheando dados de usuários...');
      await cacheUsersData();
      setStatus(prev => ({ ...prev, precacheProgress: 33 }));

      // Etapa 3: Cachear dados de calendário (50%)
      console.log('📅 Etapa 3/6: Cacheando dados de calendário...');
      await cacheCalendarData();
      setStatus(prev => ({ ...prev, precacheProgress: 50 }));

      // Etapa 4: Cachear dados de tarefas (66%)
      console.log('📋 Etapa 4/6: Cacheando dados de tarefas...');
      await cacheTasksData();
      setStatus(prev => ({ ...prev, precacheProgress: 66 }));

      // Etapa 5: Cachear dados de gamificação (83%)
      console.log('🎮 Etapa 5/6: Cacheando dados de gamificação...');
      await cacheGamificationData();
      setStatus(prev => ({ ...prev, precacheProgress: 83 }));

      // Etapa 6: Cachear dados do dashboard (100%)
      console.log('📊 Etapa 6/6: Cacheando dados do dashboard...');
      await cacheDashboardData();
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
      // Tentar diferentes endpoints de usuários
      const endpoints = ['/api/users', '/api/user/list', '/api/members'];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados de usuários cacheados de ${endpoint}`);
            return;
          }
        } catch (e) {
          // Continuar para próximo endpoint (erro esperado)
        }
      }
      console.log('ℹ️ Nenhum endpoint de usuários encontrado (normal)');
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de usuários:', error);
    }
  };

  const cacheCalendarData = async () => {
    try {
      // Tentar diferentes endpoints de calendário
      const endpoints = ['/api/calendar/events', '/api/events', '/api/calendar'];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados de calendário cacheados de ${endpoint}`);
            return;
          }
        } catch (e) {
          // Continuar para próximo endpoint (erro esperado)
        }
      }
      console.log('ℹ️ Nenhum endpoint de calendário encontrado (normal)');
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de calendário:', error);
    }
  };

  const cacheTasksData = async () => {
    try {
      // Tentar diferentes endpoints de tarefas
      const endpoints = ['/api/tasks', '/api/task/list', '/api/activities'];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados de tarefas cacheados de ${endpoint}`);
            return;
          }
        } catch (e) {
          // Continuar para próximo endpoint (erro esperado)
        }
      }
      console.log('ℹ️ Nenhum endpoint de tarefas encontrado (normal)');
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de tarefas:', error);
    }
  };

  const cacheGamificationData = async () => {
    try {
      // Tentar diferentes endpoints de gamificação
      const endpoints = [
        '/api/gamification/points',
        '/api/gamification',
        '/api/points',
        '/api/user/points',
        '/api/achievements'
      ];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados de gamificação cacheados de ${endpoint}`);
            return;
          }
        } catch (e) {
          // Continuar para próximo endpoint (erro esperado)
        }
      }
      console.log('ℹ️ Nenhum endpoint de gamificação encontrado (normal)');
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de gamificação:', error);
    }
  };

  const cacheDashboardData = async () => {
    try {
      // Tentar diferentes endpoints do dashboard
      const endpoints = [
        '/api/dashboard/stats',
        '/api/dashboard',
        '/api/stats',
        '/api/analytics'
      ];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados do dashboard cacheados de ${endpoint}`);
            return;
          }
        } catch (e) {
          // Continuar para próximo endpoint (erro esperado)
        }
      }
      console.log('ℹ️ Nenhum endpoint do dashboard encontrado (normal)');
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados do dashboard:', error);
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
