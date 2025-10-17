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

      // Etapa 1: Pré-cachear assets críticos (12%)
      console.log('📦 Etapa 1/8: Pré-cacheando assets críticos...');
      await precacheCriticalAssets();
      setStatus(prev => ({ ...prev, precacheProgress: 12 }));

      // Etapa 2: Cachear dados de usuários (25%)
      console.log('👥 Etapa 2/8: Cacheando dados de usuários...');
      await cacheUsersData();
      setStatus(prev => ({ ...prev, precacheProgress: 25 }));

      // Etapa 3: Cachear dados de calendário (37%)
      console.log('📅 Etapa 3/8: Cacheando dados de calendário...');
      await cacheCalendarData();
      setStatus(prev => ({ ...prev, precacheProgress: 37 }));

      // Etapa 4: Cachear dados de atividades (50%)
      console.log('📋 Etapa 4/8: Cacheando dados de atividades...');
      await cacheTasksData();
      setStatus(prev => ({ ...prev, precacheProgress: 50 }));

      // Etapa 5: Cachear dados de gamificação (62%)
      console.log('🎮 Etapa 5/8: Cacheando dados de gamificação...');
      await cacheGamificationData();
      setStatus(prev => ({ ...prev, precacheProgress: 62 }));

      // Etapa 6: Cachear dados do dashboard (83%)
      console.log('📊 Etapa 6/8: Cacheando dados do dashboard...');
      await cacheDashboardData();
      setStatus(prev => ({ ...prev, precacheProgress: 83 }));

      // Etapa 7: Cachear páginas importantes (91%)
      console.log('📄 Etapa 7/8: Cacheando páginas importantes...');
      await cacheImportantPages();
      setStatus(prev => ({ ...prev, precacheProgress: 91 }));

          // Etapa 8: Cachear dados de orações (87%)
          console.log('🙏 Etapa 8/9: Cacheando dados de orações...');
          await cachePrayersData();
          setStatus(prev => ({ ...prev, precacheProgress: 87 }));

          // Etapa 9: Cachear dados adicionais (100%)
          console.log('🔧 Etapa 9/9: Cacheando dados adicionais...');
          await cacheAdditionalData();
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
      
             // Teste do sistema offline após cache
             try {
               await testOfflineSystem();
             } catch (testError) {
               console.warn('⚠️ Erro no teste do sistema offline:', testError);
             }
    } catch (error) {
      console.error('❌ Erro no pré-cache:', error);
      setStatus(prev => ({ ...prev, isPrecaching: false }));
    }
  }, [status.isAdmin, status.isOfflineEnabled]);

  // Função auxiliar para testar endpoint
  const testEndpoint = async (endpoint: string): Promise<boolean> => {
    try {
      const response = await fetch(endpoint, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Funções para cachear dados específicos
  const cacheUsersData = async () => {
    try {
      // Endpoints de usuários que REALMENTE existem e funcionam
      const endpoints = [
        '/api/users',
        '/api/users/with-points', 
        '/api/users/birthdays'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados cacheados: ${endpoint}`);
            cachedCount++;
          } else {
            console.log(`⚠️ Endpoint com erro ${response.status}: ${endpoint}`);
          }
        } catch (e) {
          console.log(`❌ Erro ao acessar ${endpoint}:`, e.message);
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints de usuários cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint de usuários funcionando');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de usuários:', error);
    }
  };

  const cacheCalendarData = async () => {
    try {
      // Endpoints de calendário que REALMENTE existem e funcionam
      const endpoints = [
        '/api/calendar/events',
        '/api/events'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados cacheados: ${endpoint}`);
            cachedCount++;
          }
        } catch (e) {
          // Continuar para próximo endpoint
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints de calendário cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint de calendário encontrado');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de calendário:', error);
    }
  };

  const cacheTasksData = async () => {
    try {
      // Endpoints de tarefas que REALMENTE existem e funcionam
      const endpoints = [
        '/api/meetings'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados cacheados: ${endpoint}`);
            cachedCount++;
          } else {
            console.log(`⚠️ Endpoint com erro ${response.status}: ${endpoint}`);
          }
        } catch (e) {
          console.log(`❌ Erro ao acessar ${endpoint}:`, e.message);
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints de atividades cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint de atividades funcionando');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de atividades:', error);
    }
  };

  const cacheGamificationData = async () => {
    try {
      // Endpoints de gamificação que REALMENTE existem e funcionam
      const endpoints = [
        '/api/users/with-points'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados cacheados: ${endpoint}`);
            cachedCount++;
          } else {
            console.log(`⚠️ Endpoint com erro ${response.status}: ${endpoint}`);
          }
        } catch (e) {
          console.log(`❌ Erro ao acessar ${endpoint}:`, e.message);
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints de gamificação cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint de gamificação funcionando');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de gamificação:', error);
    }
  };

  const cacheDashboardData = async () => {
    try {
      // Endpoints do dashboard que REALMENTE existem e funcionam
      const endpoints = [
        '/api/dashboard/stats',
        '/api/dashboard/visits',
        '/api/churches'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados cacheados: ${endpoint}`);
            cachedCount++;
          }
        } catch (e) {
          // Continuar para próximo endpoint
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints do dashboard cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint do dashboard encontrado');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados do dashboard:', error);
    }
  };

  const cacheImportantPages = async () => {
    try {
      // Cachear TODAS as páginas principais para funcionar offline
      const pages = [
        '/dashboard',
        '/users',
        '/calendar',
        '/settings',
        '/tasks',
        '/gamification',
        '/prayers',
        '/chat',
        '/my-interested',
        '/elections',
        '/election-config',
        '/election-voting',
        '/election-results',
        '/election-dashboard',
        '/election-manage',
        '/push-notifications',
        '/contact',
        '/meu-cadastro'
      ];
      
      let cachedCount = 0;
      for (const page of pages) {
        try {
          console.log(`🔄 Cacheando página: ${page}`);
          const response = await fetch(page, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.text();
            await offlineDB.cacheData(page, data);
            console.log(`✅ Página cacheada: ${page}`);
            cachedCount++;
          } else {
            console.log(`⚠️ Página com erro ${response.status}: ${page}`);
          }
        } catch (e) {
          console.log(`❌ Erro ao acessar ${page}:`, e.message);
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} páginas cacheadas com sucesso`);
      } else {
        console.log('ℹ️ Nenhuma página foi cacheada');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear páginas importantes:', error);
    }
  };

  const cachePrayersData = async () => {
    try {
      // Endpoints de orações que REALMENTE existem e funcionam
      const endpoints = [
        '/api/prayers'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Cacheando orações: ${endpoint}`);
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Orações cacheadas: ${endpoint}`);
            cachedCount++;
          } else {
            console.log(`⚠️ Endpoint com erro ${response.status}: ${endpoint}`);
          }
        } catch (e) {
          console.log(`❌ Erro ao acessar ${endpoint}:`, e.message);
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints de orações cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint de orações funcionando');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados de orações:', error);
    }
  };

  const cacheAdditionalData = async () => {
    try {
      // Endpoints adicionais que REALMENTE existem e funcionam
      const endpoints = [
        '/api/relationships',
        '/api/discipleship-requests',
        '/api/emotional-checkins/admin'
      ];
      
      let cachedCount = 0;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await offlineDB.cacheData(endpoint, data);
            console.log(`✅ Dados adicionais cacheados: ${endpoint}`);
            cachedCount++;
          } else {
            console.log(`⚠️ Endpoint com erro ${response.status}: ${endpoint}`);
          }
        } catch (e) {
          console.log(`❌ Erro ao acessar ${endpoint}:`, e.message);
        }
      }
      
      if (cachedCount > 0) {
        console.log(`✅ ${cachedCount} endpoints adicionais cacheados com sucesso`);
      } else {
        console.log('ℹ️ Nenhum endpoint adicional funcionando');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao cachear dados adicionais:', error);
    }
  };

  const testOfflineSystem = async () => {
    try {
      console.log('🧪 Testando sistema offline...');
      
      // Verificar se offlineDB está disponível
      if (!offlineDB) {
        console.error('❌ offlineDB não está disponível - importação falhou');
        console.log('🔍 Verificando imports...');
        console.log('🔍 offlineDB import:', typeof offlineDB);
        return;
      }
      
      console.log('🔧 offlineDB disponível, inicializando...');
      
      // Garantir que offlineDB está inicializado
      try {
        await offlineDB.initialize();
        console.log('✅ offlineDB inicializado para teste');
      } catch (error) {
        console.error('❌ Erro ao inicializar offlineDB:', error);
        console.log('🔍 Error details:', error.message);
        return;
      }
      
      // Teste 1: Verificar se dados estão no cache
      const testEndpoints = [
        '/api/users',
        '/api/dashboard/stats',
        '/api/calendar/events'
      ];
      
      let cacheTestsPassed = 0;
      for (const endpoint of testEndpoints) {
        try {
          const cachedData = await offlineDB.getCachedData(endpoint);
          if (cachedData && cachedData.data) {
            console.log(`✅ Cache OK: ${endpoint} (${Array.isArray(cachedData.data) ? cachedData.data.length : 'dados'} itens)`);
            cacheTestsPassed++;
          } else {
            console.log(`❌ Cache vazio: ${endpoint}`);
          }
        } catch (error) {
          console.log(`❌ Erro no cache: ${endpoint}`, error);
        }
      }
      
      // Teste 2: Verificar Service Worker cache
      let swTestPassed = false;
      try {
        const swStats = await getCacheStats();
        console.log('📊 Service Worker Cache Stats:', swStats);
        
        if (swStats && swStats.totalSize > 0) {
          console.log(`✅ Service Worker cache ativo: ${swStats.totalSize} bytes`);
          swTestPassed = true;
        } else {
          console.log('❌ Service Worker cache vazio');
        }
      } catch (error) {
        console.log('❌ Erro ao verificar SW cache:', error);
      }
      
      // Teste 3: Verificar páginas cacheadas
      const testPages = ['/dashboard', '/users', '/calendar'];
      let pageTestsPassed = 0;
      
      for (const page of testPages) {
        try {
          const cachedPage = await offlineDB.getCachedData(page);
          if (cachedPage && cachedPage.data) {
            console.log(`✅ Página cacheada: ${page}`);
            pageTestsPassed++;
          } else {
            console.log(`❌ Página não cacheada: ${page}`);
          }
        } catch (error) {
          console.log(`❌ Erro ao verificar página: ${page}`, error);
        }
      }
      
      // Resultado dos testes
      const totalTests = testEndpoints.length + testPages.length + 1; // +1 para SW test
      const passedTests = cacheTestsPassed + pageTestsPassed + (swTestPassed ? 1 : 0);
      
      console.log(`📊 Resultado dos testes: ${passedTests}/${totalTests} passaram`);
      console.log(`📈 Cache de dados: ${cacheTestsPassed}/${testEndpoints.length}`);
      console.log(`📄 Páginas cacheadas: ${pageTestsPassed}/${testPages.length}`);
      console.log(`🔧 Service Worker: ${swTestPassed ? 'OK' : 'Falhou'}`);
      
      if (passedTests >= totalTests * 0.7) {
        console.log('✅ Sistema offline funcionando corretamente!');
      } else {
        console.log('⚠️ Sistema offline pode ter problemas - alguns testes falharam');
        console.log('💡 Dica: Verifique se o Service Worker está ativo e se os dados foram cacheados');
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar sistema offline:', error);
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





