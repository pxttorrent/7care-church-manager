/**
 * Componente para mostrar status do sistema offline
 * Usado para testar e monitorar funcionalidades offline
 */

import { useOffline } from '@/hooks/useOffline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Database, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const OfflineStatus = () => {
  const {
    isOnline,
    isInitialized,
    cacheStats,
    fetchWithOfflineFallback,
    clearCache,
    updateCacheStats
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
      await updateCacheStats();
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
          <div className="space-y-2">
            <h4 className="font-semibold">Estatísticas do Cache:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
        )}

        {/* Resultado do Teste */}
        {testResult && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {/* Botões de Teste */}
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
            onClick={updateCacheStats}
            disabled={!isInitialized}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Stats
          </Button>
          
          <Button 
            onClick={handleClearCache}
            disabled={!isInitialized || cacheStats.totalItems === 0}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
        </div>

        {/* Instruções */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Como testar:</strong></p>
          <p>1. Clique em "Testar Sistema" para fazer uma requisição</p>
          <p>2. Desconecte a internet e teste novamente (usará cache)</p>
          <p>3. Reconecte e teste para sincronizar dados</p>
        </div>
      </CardContent>
    </Card>
  );
};
