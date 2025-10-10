import { useState, useEffect } from 'react';
import { syncQueue } from '@/lib/syncQueue';

interface SyncStatus {
  isPending: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: { success: number; failed: number } | null;
}

/**
 * Hook para gerenciar sincronização offline
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
      const count = await syncQueue.getPendingCount();
      setSyncStatus(prev => ({
        ...prev,
        isPending: count > 0,
        pendingCount: count
      }));
    } catch (error) {
      console.error('Erro ao verificar itens pendentes:', error);
    }
  };

  const syncNow = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const result = await syncQueue.syncPendingItems();
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

