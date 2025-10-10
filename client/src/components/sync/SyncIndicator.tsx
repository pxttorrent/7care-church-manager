import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CloudOff, Cloud, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SyncIndicator() {
  const { isPending, pendingCount, isSyncing, syncNow, lastSyncResult } = useOfflineSync();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Voltou online!');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Ficou offline!');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (lastSyncResult && lastSyncResult.success > 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Recarregar a página para pegar IDs reais do servidor
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncResult]);

  // Não mostrar nada se não houver itens pendentes e não estiver sincronizando
  if (!isPending && !isSyncing && !showSuccess) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {/* Banner de status offline */}
      {!isOnline && (
        <Alert className="mb-2 bg-orange-50 border-orange-200">
          <CloudOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            <strong>Modo Offline</strong> - Alterações serão sincronizadas ao reconectar
          </AlertDescription>
        </Alert>
      )}

      {/* Itens pendentes de sincronização */}
      {isPending && !isSyncing && (
        <Alert className="mb-2 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between text-sm">
            <span className="text-blue-800">
              <strong>{pendingCount}</strong> {pendingCount === 1 ? 'alteração' : 'alterações'} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
            {isOnline && (
              <Button
                size="sm"
                variant="outline"
                onClick={syncNow}
                className="ml-2 h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sincronizar
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Sincronizando */}
      {isSyncing && (
        <Alert className="mb-2 bg-purple-50 border-purple-200">
          <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
          <AlertDescription className="text-sm text-purple-800">
            <strong>Sincronizando...</strong> Enviando alterações para o servidor
          </AlertDescription>
        </Alert>
      )}

      {/* Sucesso na sincronização */}
      {showSuccess && lastSyncResult && lastSyncResult.success > 0 && (
        <Alert className="mb-2 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            <strong>Sincronizado!</strong> {lastSyncResult.success} {lastSyncResult.success === 1 ? 'alteração enviada' : 'alterações enviadas'}
            {lastSyncResult.failed > 0 && `, ${lastSyncResult.failed} falhou`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

