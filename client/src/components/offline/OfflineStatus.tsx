/**
 * Componente para mostrar status do sistema offline
 * Usado para testar e monitorar funcionalidades offline
 */

import { useOffline } from '@/hooks/useOffline';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Database, RefreshCw, Trash2, Play, Clock, AlertTriangle, Settings, Battery, Activity, Zap, Cloud, Shield, ShieldOff, Crown } from 'lucide-react';
import { useState } from 'react';

export const OfflineStatus = () => {
  const { user } = useAuth();
  const {
    isOnline,
    isInitialized,
    cacheStats,
    queueStats,
    syncStats,
    syncConfig,
    isSyncActive,
    backgroundSyncSupported,
    backgroundSyncRegistrations,
    interceptorEnabled,
    swCacheStats,
    fetchWithOfflineFallback,
    clearCache,
    updateStats,
    addToQueue,
    processQueue,
    clearQueue,
    getPendingOperations,
    startSync,
    stopSync,
    syncNow,
    updateSyncConfig,
    registerBackgroundSync,
    forceBackgroundSync,
    enableInterceptor,
    disableInterceptor,
    clearAllInterceptorCache,
    precacheAssets
  } = useOffline();

  const [testResult, setTestResult] = useState<string>('');

  // Verificar se é admin
  const isAdmin = user?.role === 'admin' || user?.role === 'administrator';

  // Função para testar o sistema offline
  const testOfflineSystem = async () => {
    try {
      setTestResult('🔄 Testando sistema offline...');
      
      // Testar busca com fallback offline
      const result = await fetchWithOfflineFallback('/api/users');
      
      setTestResult(
        `✅ Sucesso! Dados ${result.fromCache ? 'do cache' : 'online'} ` +
        `(${result.isOnline ? 'Online' : 'Offline'})`
      );
      
      // Atualizar estatísticas
      await updateStats();
    } catch (error) {
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para limpar cache
  const handleClearCache = async () => {
    try {
      await clearCache();
      setTestResult('✅ Cache limpo com sucesso!');
    } catch (error) {
      setTestResult(`❌ Erro ao limpar cache: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para testar fila offline
  const testOfflineQueue = async () => {
    try {
      setTestResult('🔄 Testando fila offline...');
      
      // Adicionar operação de teste à fila
      const operationId = await addToQueue({
        type: 'CREATE',
        endpoint: '/api/test-offline',
        method: 'POST',
        data: { test: true, timestamp: Date.now() },
        priority: 'normal',
        maxRetries: 3,
        metadata: {
          description: 'Teste de operação offline',
          category: 'test'
        }
      });
      
      setTestResult(`✅ Operação adicionada à fila: ${operationId}`);
      await updateStats();
    } catch (error) {
      setTestResult(`❌ Erro ao testar fila: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para processar fila manualmente
  const handleProcessQueue = async () => {
    try {
      setTestResult('🔄 Processando fila...');
      const result = await processQueue();
      setTestResult(`✅ Fila processada: ${result.success} sucessos, ${result.failed} falhas`);
    } catch (error) {
      setTestResult(`❌ Erro ao processar fila: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para limpar fila
  const handleClearQueue = async () => {
    try {
      await clearQueue();
      setTestResult('✅ Fila limpa com sucesso!');
    } catch (error) {
      setTestResult(`❌ Erro ao limpar fila: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para sincronizar agora
  const handleSyncNow = async () => {
    try {
      setTestResult('🔄 Sincronizando...');
      const result = await syncNow();
      setTestResult(`✅ Sincronização concluída: ${result.operations} operações em ${result.duration}ms`);
    } catch (error) {
      setTestResult(`❌ Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para iniciar/parar sincronização
  const handleToggleSync = async () => {
    try {
      if (isSyncActive) {
        stopSync();
        setTestResult('⏸️ Sincronização automática pausada');
      } else {
        await startSync();
        setTestResult('▶️ Sincronização automática iniciada');
      }
    } catch (error) {
      setTestResult(`❌ Erro ao alternar sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para registrar Background Sync
  const handleRegisterBackgroundSync = async () => {
    try {
      setTestResult('🔄 Registrando Background Sync...');
      const success = await registerBackgroundSync();
      
      if (success) {
        setTestResult('✅ Background Sync registrado! Sincronização funcionará mesmo com app fechado.');
      } else {
        setTestResult('⚠️ Background Sync não suportado ou falhou ao registrar.');
      }
    } catch (error) {
      setTestResult(`❌ Erro ao registrar Background Sync: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para forçar Background Sync
  const handleForceBackgroundSync = async () => {
    try {
      setTestResult('🚀 Forçando Background Sync...');
      const success = await forceBackgroundSync();
      
      if (success) {
        setTestResult('✅ Background Sync forçado! Verifique o console para logs.');
      } else {
        setTestResult('⚠️ Background Sync não suportado ou falhou.');
      }
    } catch (error) {
      setTestResult(`❌ Erro ao forçar Background Sync: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para habilitar/desabilitar interceptador
  const handleToggleInterceptor = () => {
    try {
      if (interceptorEnabled) {
        disableInterceptor();
        setTestResult('🔴 Interceptador desabilitado - APIs não serão interceptadas');
      } else {
        enableInterceptor();
        setTestResult('🟢 Interceptador habilitado - Todas as APIs serão interceptadas');
      }
    } catch (error) {
      setTestResult(`❌ Erro ao alternar interceptador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para limpar cache do interceptador
  const handleClearInterceptorCache = async () => {
    try {
      setTestResult('🗑️ Limpando cache do interceptador...');
      await clearAllInterceptorCache();
      setTestResult('✅ Cache do interceptador limpo!');
    } catch (error) {
      setTestResult(`❌ Erro ao limpar cache: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para pré-cachear assets
  const handlePrecacheAssets = async () => {
    try {
      setTestResult('📦 Pré-cacheando assets críticos...');
      await precacheAssets();
      setTestResult(`✅ Assets pré-cacheados! Cache: ${swCacheStats.cachePercentage}% completo`);
    } catch (error) {
      setTestResult(`❌ Erro ao pré-cachear assets: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para formatar tamanho
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para formatar data
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  // Se não for admin, mostrar mensagem de restrição
  if (!isAdmin) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Sistema Offline - Acesso Restrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Funcionalidade Restrita</h3>
            <p className="text-muted-foreground mb-4">
              O sistema offline completo está disponível apenas para administradores.
            </p>
            <Badge variant="secondary">
              Seu perfil: {user?.role || 'Não identificado'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-4">
              Apenas administradores têm acesso ao sistema offline com pré-cache automático.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Status do Sistema Offline
          <Badge variant="default" className="ml-auto">
            Admin
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status de Conectividade */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span>Conectividade:</span>
          </div>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Status do Banco */}
        <div className="flex items-center justify-between">
          <span>Banco Offline:</span>
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? 'Inicializado' : 'Carregando...'}
          </Badge>
        </div>

        {/* Estatísticas do Cache */}
        {isInitialized && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Database className="h-4 w-4" />
                Cache:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">Itens:</span>
                  <span className="ml-2 font-medium">{cacheStats.totalItems}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tamanho:</span>
                  <span className="ml-2 font-medium">{formatBytes(cacheStats.totalSize)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mais antigo:</span>
                  <span className="ml-2 font-medium text-xs">{formatDate(cacheStats.oldestItem)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mais recente:</span>
                  <span className="ml-2 font-medium text-xs">{formatDate(cacheStats.newestItem)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fila de Operações:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-medium">{queueStats.total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pendentes:</span>
                  <Badge variant={queueStats.pending > 0 ? "default" : "secondary"} className="ml-2">
                    {queueStats.pending}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Falhas:</span>
                  <Badge variant={queueStats.failed > 0 ? "destructive" : "secondary"} className="ml-2">
                    {queueStats.failed}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Mais antiga:</span>
                  <span className="ml-2 font-medium text-xs">{formatDate(queueStats.oldestOperation)}</span>
                </div>
              </div>
              
              {/* Estatísticas por tipo */}
              {Object.keys(queueStats.byType).length > 0 && (
                <div className="mt-2">
                  <span className="text-muted-foreground text-xs">Por tipo:</span>
                  <div className="flex gap-1 mt-1">
                    {Object.entries(queueStats.byType).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Sincronização:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={isSyncActive ? "default" : "secondary"} className="ml-2">
                    {isSyncActive ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Bateria:</span>
                  <span className="ml-2 font-medium flex items-center gap-1">
                    <Battery className="h-3 w-3" />
                    {syncStats.batteryLevel}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Syncs:</span>
                  <span className="ml-2 font-medium">{syncStats.totalSyncs}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sucessos:</span>
                  <Badge variant="default" className="ml-2">
                    {syncStats.successfulSyncs}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Falhas:</span>
                  <Badge variant={syncStats.failedSyncs > 0 ? "destructive" : "secondary"} className="ml-2">
                    {syncStats.failedSyncs}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Última Sync:</span>
                  <span className="ml-2 font-medium text-xs">{formatDate(syncStats.lastSync)}</span>
                </div>
              </div>
              
              {/* Configurações */}
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="h-3 w-3" />
                  <span className="font-medium">Configurações:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Intervalo: {syncConfig.interval / 1000}s</div>
                  <div>Bateria mín: {syncConfig.batteryThreshold}%</div>
                  <div>WiFi apenas: {syncConfig.wifiOnly ? 'Sim' : 'Não'}</div>
                  <div>Max tentativas: {syncConfig.maxRetries}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Background Sync:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">Suporte:</span>
                  <Badge variant={backgroundSyncSupported ? "default" : "secondary"} className="ml-2">
                    {backgroundSyncSupported ? 'Disponível' : 'Não suportado'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Registros:</span>
                  <span className="ml-2 font-medium">{backgroundSyncRegistrations.length}</span>
                </div>
              </div>
              
              {/* Lista de registros */}
              {backgroundSyncRegistrations.length > 0 && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3 w-3" />
                    <span className="font-medium">Registros Ativos:</span>
                  </div>
                  <div className="space-y-1">
                    {backgroundSyncRegistrations.map((reg, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{reg.tag}</span>
                        <Badge 
                          variant={
                            reg.status === 'completed' ? 'default' :
                            reg.status === 'failed' ? 'destructive' :
                            reg.status === 'pending' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {reg.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Interceptador Global:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={interceptorEnabled ? "default" : "secondary"} className="ml-2">
                    {interceptorEnabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Cobertura:</span>
                  <span className="ml-2 font-medium">Todas as APIs</span>
                </div>
              </div>
              
              {/* Informações do interceptador */}
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-3 w-3" />
                  <span className="font-medium">Funcionalidades:</span>
                </div>
                <div className="space-y-1">
                  <div>• Cache automático para GET requests</div>
                  <div>• Fila automática para POST/PUT/DELETE</div>
                  <div>• Fallback offline inteligente</div>
                  <div>• Intercepta TODAS as chamadas fetch()</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Database className="h-4 w-4" />
                Service Worker Cache:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">Assets:</span>
                  <span className="ml-2 font-medium">{swCacheStats.cachedAssets}/{swCacheStats.totalAssets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cobertura:</span>
                  <Badge variant={swCacheStats.cachePercentage > 80 ? "default" : swCacheStats.cachePercentage > 50 ? "secondary" : "destructive"} className="ml-2">
                    {swCacheStats.cachePercentage}%
                  </Badge>
                </div>
              </div>
              
              {/* Detalhes do cache */}
              {Object.keys(swCacheStats.assetsByCache).length > 0 && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-3 w-3" />
                    <span className="font-medium">Caches Ativos:</span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(swCacheStats.assetsByCache).map(([cacheName, count]) => (
                      <div key={cacheName} className="flex justify-between items-center">
                        <span>{cacheName}</span>
                        <Badge variant="outline" className="text-xs">
                          {count} assets
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultado do Teste */}
        {testResult && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {/* Botões de Teste */}
        <div className="space-y-2">
          {/* Linha 1: Testes básicos */}
          <div className="flex gap-2">
            <Button 
              onClick={testOfflineSystem}
              disabled={!isInitialized}
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Testar Sistema
            </Button>
            
            <Button 
              onClick={handlePrecacheAssets}
              disabled={!isInitialized}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Database className="h-4 w-4 mr-2" />
              Pré-cachear Assets
            </Button>
          </div>

          {/* Linha 1.5: Teste de fila */}
          <div className="flex gap-2">
            <Button 
              onClick={testOfflineQueue}
              disabled={!isInitialized}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Testar Fila
            </Button>
            
            <Button 
              onClick={handleProcessQueue}
              disabled={!isInitialized || queueStats.total === 0}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Processar Fila
            </Button>
          </div>

          {/* Linha 2: Sincronização */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncNow}
              disabled={!isInitialized}
              variant="default"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar Agora
            </Button>
            
            <Button 
              onClick={handleToggleSync}
              disabled={!isInitialized}
              variant={isSyncActive ? "destructive" : "default"}
              size="sm"
              className="flex-1"
            >
              <Activity className="h-4 w-4 mr-2" />
              {isSyncActive ? 'Pausar' : 'Iniciar'}
            </Button>
          </div>

          {/* Linha 3: Gerenciamento */}
          <div className="flex gap-2">
            <Button 
              onClick={handleProcessQueue}
              disabled={!isInitialized || queueStats.total === 0}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Processar Fila
            </Button>
            
            <Button 
              onClick={updateStats}
              disabled={!isInitialized}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Linha 4: Interceptador */}
          <div className="flex gap-2">
            <Button 
              onClick={handleToggleInterceptor}
              disabled={!isInitialized}
              variant={interceptorEnabled ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              {interceptorEnabled ? (
                <ShieldOff className="h-4 w-4 mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {interceptorEnabled ? 'Desabilitar' : 'Habilitar'} Interceptor
            </Button>
            
            <Button 
              onClick={handleClearInterceptorCache}
              disabled={!isInitialized || !interceptorEnabled}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache API
            </Button>
          </div>

          {/* Linha 5: Background Sync */}
          {backgroundSyncSupported && (
            <div className="flex gap-2">
              <Button 
                onClick={handleRegisterBackgroundSync}
                disabled={!isInitialized}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Registrar BG Sync
              </Button>
              
              <Button 
                onClick={handleForceBackgroundSync}
                disabled={!isInitialized}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Forçar BG Sync
              </Button>
            </div>
          )}

          {/* Linha 6: Limpeza */}
          <div className="flex gap-2">
            <Button 
              onClick={handleClearCache}
              disabled={!isInitialized || cacheStats.totalItems === 0}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            
            <Button 
              onClick={handleClearQueue}
              disabled={!isInitialized || queueStats.total === 0}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Limpar Fila
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Como testar:</strong></p>
          <p>1. <strong>Pré-cache:</strong> "Pré-cachear Assets" baixa todos os arquivos para funcionar offline</p>
          <p>2. <strong>Interceptador:</strong> "Habilitar Interceptor" ativa cache automático para TODAS as APIs</p>
          <p>3. <strong>Cache:</strong> "Testar Sistema" faz requisição e salva cache</p>
          <p>4. <strong>Fila:</strong> "Testar Fila" adiciona operação offline</p>
          <p>5. <strong>Sync Auto:</strong> "Iniciar" ativa sincronização automática</p>
          <p>6. <strong>Sync Manual:</strong> "Sincronizar Agora" força sincronização</p>
          <p>7. <strong>BG Sync:</strong> "Registrar BG Sync" permite sync com app fechado</p>
          <p>8. <strong>Offline:</strong> Desconecte internet e teste (usará cache automático)</p>
          <p>9. <strong>Inteligente:</strong> Pausa com bateria baixa, pausa quando offline</p>
        </div>
      </CardContent>
    </Card>
  );
};
