/**
 * Componente para mostrar status do sistema offline
 * Usado para testar e monitorar funcionalidades offline
 */

import { useOffline } from '@/hooks/useOffline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Database, RefreshCw, Trash2, Play, Clock, AlertTriangle, Settings, Battery, Activity } from 'lucide-react';
import { useState } from 'react';

export const OfflineStatus = () => {
  const {
    isOnline,
    isInitialized,
    cacheStats,
    queueStats,
    syncStats,
    syncConfig,
    isSyncActive,
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
    updateSyncConfig
  } = useOffline();

  const [testResult, setTestResult] = useState<string>('');

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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Status do Sistema Offline
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
              onClick={testOfflineQueue}
              disabled={!isInitialized}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Testar Fila
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

          {/* Linha 4: Limpeza */}
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
          <p>1. <strong>Cache:</strong> "Testar Sistema" faz requisição e salva cache</p>
          <p>2. <strong>Fila:</strong> "Testar Fila" adiciona operação offline</p>
          <p>3. <strong>Sync Auto:</strong> "Iniciar" ativa sincronização automática</p>
          <p>4. <strong>Sync Manual:</strong> "Sincronizar Agora" força sincronização</p>
          <p>5. <strong>Offline:</strong> Desconecte internet e teste (usará cache)</p>
          <p>6. <strong>Inteligente:</strong> Pausa com bateria baixa, pausa quando offline</p>
        </div>
      </CardContent>
    </Card>
  );
};
