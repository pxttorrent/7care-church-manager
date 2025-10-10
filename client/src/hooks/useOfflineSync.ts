import { useState, useEffect } from 'react';
import { offlineStorage } from '@/lib/offlineStorage';

interface SyncStatus {
  isPending: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: { success: number; failed: number; errors: string[] } | null;
}

/**
 * Hook para gerenciar sincronização offline
 * 🆕 Atualizado para usar o novo offlineStorage
 */
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isPending: false,
    pendingCount: 0,
    isSyncing: false,
    lastSyncResult: null
  });

  const updatePendingCount = async () => {
    try {
      const info = await offlineStorage.getSyncInfo();
      setSyncStatus(prev => ({
        ...prev,
        isPending: info.pendingCount > 0,
        pendingCount: info.pendingCount
      }));
    } catch (error) {
      console.error('Erro ao verificar itens pendentes:', error);
    }
  };

  const syncNow = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const result = await offlineStorage.syncWithServer();
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncResult: result
      }));
      await updatePendingCount();
      return result;
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  };

  useEffect(() => {
    // Inicializar offlineStorage
    offlineStorage.init().catch(console.error);

    // Verificar itens pendentes ao montar
    updatePendingCount();

    // Atualizar quando completar sincronização
    const handleSyncComplete = () => {
      updatePendingCount();
    };

    window.addEventListener('syncComplete', handleSyncComplete);
    
    // Verificar periodicamente
    const interval = setInterval(updatePendingCount, 10000); // A cada 10s

    return () => {
      window.removeEventListener('syncComplete', handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  return {
    ...syncStatus,
    syncNow,
    refreshStatus: updatePendingCount
  };
}

