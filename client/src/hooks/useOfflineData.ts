/**
 * 🎣 HOOK USEOFFLINEDATA - Gerenciamento de Dados Offline-First
 * 
 * Este hook fornece uma interface simples para trabalhar com dados que funcionam offline.
 * Integra-se perfeitamente com React Query e sincroniza automaticamente quando online.
 * 
 * Uso:
 * ```tsx
 * const { data, create, update, remove, syncing } = useOfflineData({
 *   storeName: 'tasks',
 *   endpoint: '/api/tasks',
 *   queryKey: ['tasks']
 * });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineStorage } from '@/lib/offlineStorage';

// ========================================
// TIPOS
// ========================================

export interface UseOfflineDataOptions<T> {
  /** Nome do store no IndexedDB */
  storeName: string;
  
  /** Endpoint da API (ex: '/api/tasks') */
  endpoint: string;
  
  /** Query key do React Query (ex: ['tasks']) */
  queryKey: any[];
  
  /** Buscar dados do servidor ao montar (padrão: true) */
  autoFetch?: boolean;
  
  /** Intervalo de sincronização automática em ms (padrão: 30000 = 30s) */
  syncInterval?: number;
  
  /** Headers customizados para requisições */
  headers?: Record<string, string>;
  
  /** Transformar dados antes de salvar localmente */
  transformBeforeSave?: (data: T) => T;
  
  /** Transformar dados ao recuperar */
  transformAfterLoad?: (data: T) => T;
}

export interface UseOfflineDataReturn<T> {
  /** Dados atuais (do cache local ou servidor) */
  data: T[];
  
  /** Estado de carregamento inicial */
  loading: boolean;
  
  /** Estado de sincronização */
  syncing: boolean;
  
  /** Status da conexão */
  isOnline: boolean;
  
  /** Criar novo item */
  create: (item: Omit<T, 'id'>) => Promise<T>;
  
  /** Atualizar item existente */
  update: (id: any, updates: Partial<T>) => Promise<T>;
  
  /** Remover item */
  remove: (id: any) => Promise<void>;
  
  /** Recarregar dados do servidor */
  refresh: () => Promise<void>;
  
  /** Sincronizar manualmente com servidor */
  sync: () => Promise<{ success: number; failed: number; errors: string[] }>;
  
  /** Informações de sincronização */
  syncInfo: {
    lastSync: string | null;
    pendingCount: number;
    errorCount: number;
  };
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export function useOfflineData<T extends { id: any }>({
  storeName,
  endpoint,
  queryKey,
  autoFetch = true,
  syncInterval = 30000,
  headers = {},
  transformBeforeSave,
  transformAfterLoad
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
  const queryClient = useQueryClient();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState({
    lastSync: null as string | null,
    pendingCount: 0,
    errorCount: 0
  });

  // ========================================
  // MONITORAR CONEXÃO
  // ========================================

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (online) {
        console.log('🌐 Conexão restaurada - iniciando sincronização');
        syncWithServer();
      } else {
        console.log('📴 Modo offline ativado');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // ========================================
  // BUSCAR DADOS (OFFLINE-FIRST)
  // ========================================

  const { data: queryData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`📖 [${storeName}] Carregando dados...`);
      
      // 1. SEMPRE carregar do cache local primeiro (rápido)
      let localData = await offlineStorage.getAll<T>(storeName);
      
      // Transformar dados se necessário
      if (transformAfterLoad) {
        localData = localData.map(transformAfterLoad);
      }
      
      console.log(`💾 [${storeName}] ${localData.length} itens do cache local`);

      // 2. Se online, buscar do servidor em background
      if (navigator.onLine && autoFetch) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'x-user-id': '1', // TODO: Pegar do contexto de autenticação
              ...headers
            }
          });

          if (response.ok) {
            const serverData = await response.json();
            
            // A API pode retornar { tasks: [...] } ou diretamente [...]
            const actualData = Array.isArray(serverData) 
              ? serverData 
              : (serverData[storeName] || serverData.data || []);

            console.log(`🌐 [${storeName}] ${actualData.length} itens do servidor`);

            // Atualizar cache local com dados do servidor
            await offlineStorage.clear(storeName);
            for (const item of actualData) {
              const itemToSave = transformBeforeSave ? transformBeforeSave(item) : item;
              await offlineStorage.save(storeName, { 
                ...itemToSave, 
                _synced: true 
              });
            }

            // Retornar dados do servidor (mais atualizados)
            return transformAfterLoad 
              ? actualData.map(transformAfterLoad)
              : actualData;
          } else {
            console.warn(`⚠️ [${storeName}] Servidor retornou ${response.status}, usando cache local`);
          }
        } catch (error) {
          console.warn(`⚠️ [${storeName}] Erro ao buscar do servidor:`, error);
        }
      }

      // Retornar dados locais (se offline ou erro no servidor)
      return localData;
    },
    staleTime: 5000, // Considera dados válidos por 5 segundos
    gcTime: 1000 * 60 * 60, // Mantém no cache por 1 hora (antes era cacheTime)
  });

  // ========================================
  // CRIAR ITEM
  // ========================================

  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<T, 'id'>) => {
      // Gerar ID temporário
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const itemWithId = {
        ...newItem,
        id: tempId,
        created_at: new Date().toISOString(),
        _localCreated: true,
        _synced: false
      } as T;

      // 1. Salvar localmente IMEDIATAMENTE
      const itemToSave = transformBeforeSave ? transformBeforeSave(itemWithId) : itemWithId;
      await offlineStorage.save(storeName, itemToSave);
      console.log(`💾 [${storeName}] Item criado localmente:`, tempId);

      // 2. Adicionar à fila de sincronização
      await offlineStorage.addToSyncQueue({
        type: 'CREATE',
        storeName,
        endpoint,
        data: itemWithId
      });

      // 3. Se online, tentar sincronizar imediatamente
      if (navigator.onLine) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': '1',
              ...headers
            },
            body: JSON.stringify(newItem)
          });

          if (response.ok) {
            const serverData = await response.json();
            const actualData = serverData[storeName.slice(0, -1)] || serverData; // tasks -> task
            
            // Atualizar com dados do servidor (ID real)
            if (actualData && actualData.id) {
              await offlineStorage.save(storeName, {
                ...actualData,
                _synced: true
              });
              console.log(`✅ [${storeName}] Item sincronizado:`, actualData.id);
              return actualData;
            }
          }
        } catch (error) {
          console.warn(`⚠️ [${storeName}] Erro ao sincronizar criação:`, error);
        }
      }

      return itemWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      updateSyncInfo();
    }
  });

  // ========================================
  // ATUALIZAR ITEM
  // ========================================

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: any; updates: Partial<T> }) => {
      // 1. Buscar item atual
      const existing = await offlineStorage.getById<T>(storeName, id);
      if (!existing) {
        throw new Error(`Item ${id} não encontrado`);
      }

      // 2. Mesclar com updates
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
        _synced: false
      } as T;

      // 3. Salvar localmente
      const itemToSave = transformBeforeSave ? transformBeforeSave(updated) : updated;
      await offlineStorage.save(storeName, itemToSave);
      console.log(`💾 [${storeName}] Item atualizado localmente:`, id);

      // 4. Adicionar à fila
      await offlineStorage.addToSyncQueue({
        type: 'UPDATE',
        storeName,
        endpoint,
        data: updated
      });

      // 5. Se online, tentar sincronizar
      if (navigator.onLine) {
        try {
          const response = await fetch(`${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': '1',
              ...headers
            },
            body: JSON.stringify(updates)
          });

          if (response.ok) {
            const serverData = await response.json();
            const actualData = serverData[storeName.slice(0, -1)] || serverData;
            
            if (actualData) {
              await offlineStorage.save(storeName, {
                ...actualData,
                _synced: true
              });
              console.log(`✅ [${storeName}] Item sincronizado:`, id);
              return actualData;
            }
          }
        } catch (error) {
          console.warn(`⚠️ [${storeName}] Erro ao sincronizar atualização:`, error);
        }
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      updateSyncInfo();
    }
  });

  // ========================================
  // REMOVER ITEM
  // ========================================

  const removeMutation = useMutation({
    mutationFn: async (id: any) => {
      // 1. Deletar localmente
      await offlineStorage.delete(storeName, id);
      console.log(`🗑️ [${storeName}] Item removido localmente:`, id);

      // 2. Adicionar à fila
      await offlineStorage.addToSyncQueue({
        type: 'DELETE',
        storeName,
        endpoint,
        data: { id }
      });

      // 3. Se online, tentar sincronizar
      if (navigator.onLine) {
        try {
          const response = await fetch(`${endpoint}/${id}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': '1',
              ...headers
            }
          });

          if (response.ok) {
            console.log(`✅ [${storeName}] Item deletado no servidor:`, id);
          }
        } catch (error) {
          console.warn(`⚠️ [${storeName}] Erro ao sincronizar remoção:`, error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      updateSyncInfo();
    }
  });

  // ========================================
  // SINCRONIZAÇÃO
  // ========================================

  const syncWithServer = useCallback(async () => {
    if (!navigator.onLine || syncing) return { success: 0, failed: 0, errors: [] };

    setSyncing(true);
    try {
      const result = await offlineStorage.syncWithServer();
      console.log(`🔄 [${storeName}] Sincronização:`, result);
      
      // Recarregar dados após sincronização
      await queryClient.invalidateQueries({ queryKey });
      await updateSyncInfo();
      
      return result;
    } catch (error) {
      console.error(`❌ [${storeName}] Erro na sincronização:`, error);
      return { success: 0, failed: 0, errors: [String(error)] };
    } finally {
      setSyncing(false);
    }
  }, [syncing, queryClient, queryKey, storeName]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // ========================================
  // ATUALIZAR INFO DE SINCRONIZAÇÃO
  // ========================================

  const updateSyncInfo = useCallback(async () => {
    const info = await offlineStorage.getSyncInfo();
    setSyncInfo(info);
  }, []);

  useEffect(() => {
    updateSyncInfo();
  }, [updateSyncInfo]);

  // ========================================
  // AUTO-SYNC PERIÓDICO
  // ========================================

  useEffect(() => {
    if (!syncInterval || !isOnline) return;

    const interval = setInterval(() => {
      if (navigator.onLine && !syncing) {
        syncWithServer();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [syncInterval, isOnline, syncing, syncWithServer]);

  // ========================================
  // RETORNO
  // ========================================

  return {
    data: queryData || [],
    loading: isLoading,
    syncing,
    isOnline,
    create: (item) => createMutation.mutateAsync(item),
    update: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    remove: (id) => removeMutation.mutateAsync(id),
    refresh,
    sync: syncWithServer,
    syncInfo
  };
}

