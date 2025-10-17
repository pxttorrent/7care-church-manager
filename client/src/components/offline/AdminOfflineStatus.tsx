/**
 * Componente para mostrar status do sistema offline exclusivo para admins
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Database, 
  Wifi, 
  WifiOff, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Crown,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useAdminOffline } from '@/hooks/useAdminOffline';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export const AdminOfflineStatus = () => {
  const { user } = useAuth();
  const {
    isAdmin,
    isOfflineEnabled,
    isInitialized,
    isPrecaching,
    precacheProgress,
    cacheStats,
    swCacheStats,
    precacheAllAdminData,
    initializeOfflineSystem
  } = useAdminOffline();

  const [testResult, setTestResult] = useState<string>('');

  // Função para formatar tamanho
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para testar o sistema
  const handleTestSystem = async () => {
    try {
      setTestResult('🧪 Testando sistema offline para admin...');
      
      if (!isAdmin) {
        setTestResult('❌ Acesso negado: apenas admins podem usar o sistema offline');
        return;
      }

      if (!isOfflineEnabled) {
        setTestResult('❌ Sistema offline não está habilitado');
        return;
      }

      // Testar cache
      const testData = { test: 'admin-offline-test', timestamp: Date.now() };
      await offlineDB.cacheData('/api/test/admin', testData);
      const cachedData = await offlineDB.getCachedData('/api/test/admin');
      
      if (cachedData) {
        setTestResult('✅ Sistema offline funcionando perfeitamente para admin!');
      } else {
        setTestResult('❌ Erro no sistema de cache');
      }
    } catch (error) {
      setTestResult(`❌ Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para forçar pré-cache
  const handleForcePrecache = async () => {
    try {
      setTestResult('🚀 Iniciando pré-cache manual...');
      await precacheAllAdminData();
      setTestResult('✅ Pré-cache manual concluído!');
    } catch (error) {
      setTestResult(`❌ Erro no pré-cache: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sistema Offline - Acesso Restrito
          </CardTitle>
          <CardDescription>
            Funcionalidade exclusiva para administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              O sistema offline está disponível apenas para administradores.
            </p>
            <Badge variant="secondary" className="mt-4">
              Seu perfil: {user?.role || 'Não identificado'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Sistema Offline Admin
          <Badge variant="default" className="ml-auto">
            Admin
          </Badge>
        </CardTitle>
        <CardDescription>
          Sistema offline exclusivo para administradores com pré-cache automático
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4" />
            Status do Sistema:
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Inicializado:</span>
              <Badge 
                variant={isInitialized ? "default" : "secondary"} 
                className="ml-2"
              >
                {isInitialized ? 'Sim' : 'Não'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Habilitado:</span>
              <Badge 
                variant={isOfflineEnabled ? "default" : "destructive"} 
                className="ml-2"
              >
                {isOfflineEnabled ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progresso do Pré-cache */}
        {isPrecaching && (
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Download className="h-4 w-4" />
              Pré-cacheando Dados:
            </h4>
            <div className="space-y-2">
              <Progress value={precacheProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {precacheProgress}% concluído
              </p>
            </div>
          </div>
        )}

        {/* Estatísticas do Cache */}
        {isInitialized && (
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Database className="h-4 w-4" />
              Estatísticas do Cache:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Itens em Cache:</span>
                <span className="ml-2 font-medium">{cacheStats.totalItems}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tamanho Total:</span>
                <span className="ml-2 font-medium">{formatBytes(cacheStats.totalSize)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Assets:</span>
                <span className="ml-2 font-medium">{swCacheStats.cachedAssets}/{swCacheStats.totalAssets}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cobertura:</span>
                <Badge 
                  variant={
                    swCacheStats.cachePercentage > 80 ? "default" :
                    swCacheStats.cachePercentage > 50 ? "secondary" : "destructive"
                  } 
                  className="ml-2"
                >
                  {swCacheStats.cachePercentage}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Controle */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button 
              onClick={handleTestSystem}
              disabled={!isInitialized || !isOfflineEnabled}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Testar Sistema
            </Button>
            
            <Button 
              onClick={handleForcePrecache}
              disabled={!isInitialized || !isOfflineEnabled || isPrecaching}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isPrecaching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Pré-cacheando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Pré-cachear Agora
                </>
              )}
            </Button>
          </div>

          <Button 
            onClick={initializeOfflineSystem}
            disabled={isInitialized}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Reinicializar Sistema
          </Button>
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {/* Informações para Admin */}
        <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted rounded-lg">
          <p><strong>🔒 Sistema Exclusivo para Admins:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• Pré-cache automático após login</li>
            <li>• Cache de todos os dados e páginas</li>
            <li>• Funcionamento offline completo</li>
            <li>• Background sync para sincronização</li>
            <li>• Interceptador global ativado</li>
          </ul>
          <p className="mt-2"><strong>💡 Dica:</strong> O sistema pré-cacheia automaticamente após o login para garantir acesso offline completo.</p>
        </div>
      </CardContent>
    </Card>
  );
};
