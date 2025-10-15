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
  
  /** Intervalo de sincronização automática em ms (padrão: 60000 = 60s) */
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
      const queryId = Math.random().toString(36).substr(2, 5);
      console.log(`📖 [${storeName}] [${queryId}] INÍCIO QUERY - Carregando dados...`);
      
      // Se online, SEMPRE buscar do servidor primeiro (fonte da verdade)
      if (navigator.onLine && autoFetch) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'x-user-id': '1',
              'Cache-Control': 'no-cache', // Forçar dados frescos
              ...headers
            }
          });

          if (response.ok) {
            const serverData = await response.json();
            
            // A API pode retornar { tasks: [...] } ou diretamente [...]
            const actualData = Array.isArray(serverData) 
              ? serverData 
              : (serverData[storeName] || serverData.data || []);

            console.log(`🌐 [${storeName}] [${queryId}] ${actualData.length} itens do servidor (fonte da verdade)`);

            // LIMPAR cache completamente e recriar
            console.log(`🧹 [${storeName}] [${queryId}] Limpando e recriando cache...`);
            
            // Verificar tarefas temporárias antes de limpar
            const localData = await offlineStorage.getAll<T>(storeName);
            const tempTasks = localData.filter((item: any) => String(item.id).startsWith('temp_') && !item._synced);
            console.log(`💾 [${storeName}] Preservando ${tempTasks.length} tarefas offline`);
            
            // Limpar tudo
            await offlineStorage.clear(storeName);
            
            // Recriar com dados do servidor (fonte da verdade)
            for (const item of actualData) {
              const itemToSave = transformBeforeSave ? transformBeforeSave(item) : item;
              await offlineStorage.save(storeName, { 
                ...itemToSave, 
                _synced: true 
              });
            }
            
            // Recolocar tarefas temporárias
            for (const tempTask of tempTasks) {
              await offlineStorage.save(storeName, tempTask);
            }
            
            console.log(`✅ [${storeName}] [${queryId}] Cache atualizado: ${actualData.length} + ${tempTasks.length} temp`);

            // Retornar dados do servidor + temp (fonte única da verdade)
            const finalData = transformAfterLoad 
              ? [...actualData, ...tempTasks].map(transformAfterLoad)
              : [...actualData, ...tempTasks];
            
            console.log(`📤 [${storeName}] [${queryId}] Retornando ${finalData.length} itens`);
            return finalData as T[];
          } else {
            console.warn(`⚠️ [${storeName}] Servidor retornou ${response.status}, usando cache`);
          }
        } catch (error) {
          console.warn(`⚠️ [${storeName}] Erro ao buscar servidor:`, error);
        }
      }

      // OFFLINE ou falha: usar cache local
      console.log(`📴 [${storeName}] [${queryId}] OFFLINE - usando cache local`);
      let localData = await offlineStorage.getAll<T>(storeName);
      
      if (transformAfterLoad) {
        localData = localData.map(transformAfterLoad);
      }
      
      console.log(`📤 [${storeName}] [${queryId}] Retornando ${localData.length} itens do cache`);
      return localData;
    },
    staleTime: 0, // SEMPRE revalidar (evita cache do React Query)
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos apenas
  });

  // Remover duplicatas SIMPLES - apenas por ID único
  const uniqueData = queryData ? Array.from(
    new Map(queryData.map((item: T) => [String(item.id), item])).values()
  ) : [];
  
  if (queryData && uniqueData.length !== queryData.length) {
    console.warn(`⚠️ [${storeName}] Duplicatas removidas: ${queryData.length} -> ${uniqueData.length}`);
  }
  
  // Ordenar por data de criação (mais recentes primeiro)
  const sortedData = uniqueData.sort((a: any, b: any) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  // ========================================
  // CRIAR ITEM
  // ========================================

  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<T, 'id'>) => {
      console.log(`🆕 [${storeName}] INÍCIO CREATE MUTATION:`, newItem);
      console.log(`🌐 [${storeName}] Status online:`, navigator.onLine);
      
      // ============================================
      // CENÁRIO 1: ONLINE - criar direto no servidor
      // ============================================
      if (navigator.onLine) {
        console.log(`✨ [${storeName}] ONLINE - criando direto no servidor (sem ID temp)...`);
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
            const actualData = serverData[storeName.slice(0, -1)] || serverData;
            console.log(`📥 [${storeName}] Item criado no servidor:`, actualData);
            
            if (actualData && actualData.id) {
              // Salvar direto com ID real do servidor
              await offlineStorage.save(storeName, {
                ...actualData,
                _synced: true
              });
              console.log(`✅ [${storeName}] Item salvo no cache com ID real:`, actualData.id);
              return actualData;
            }
          } else {
            console.error(`❌ [${storeName}] Servidor retornou ${response.status}, mudando para modo offline`);
            // Se servidor falhou, tratar como offline
          }
        } catch (error) {
          console.error(`❌ [${storeName}] Erro ao criar no servidor, mudando para modo offline:`, error);
          // Se falhou, tratar como offline
        }
      }
      
      // ============================================
      // CENÁRIO 2: OFFLINE - usar ID temporário
      // ============================================
      console.log(`📴 [${storeName}] OFFLINE - criando com ID temporário...`);
      
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🔢 [${storeName}] ID temporário gerado:`, tempId);
      
      const itemWithId = {
        ...newItem,
        id: tempId,
        created_at: new Date().toISOString(),
        _localCreated: true,
        _synced: false
      } as T;

      // Salvar localmente com ID temporário
      const itemToSave = transformBeforeSave ? transformBeforeSave(itemWithId) : itemWithId;
      await offlineStorage.save(storeName, itemToSave);
      console.log(`💾 [${storeName}] Item salvo localmente com ID temp:`, tempId);

      // Adicionar à fila de sincronização para quando voltar online
      await offlineStorage.addToSyncQueue({
        type: 'CREATE',
        storeName,
        endpoint,
        data: itemWithId
      });
      console.log(`📋 [${storeName}] Adicionado à fila de sync para sincronizar depois`);

      console.log(`🔙 [${storeName}] Retornando item offline:`, itemWithId.id);
      return itemWithId;
    },
    onSuccess: (data) => {
      console.log(`🎉 [${storeName}] CREATE onSuccess - item criado:`, data?.id);
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

      // 4. Adicionar à fila (salvando apenas os updates originais)
      await offlineStorage.addToSyncQueue({
        type: 'UPDATE',
        storeName,
        endpoint,
        data: updated,
        originalUpdates: updates // ← Campos que foram realmente alterados
      } as any);

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
              // Se o ID retornado for diferente, deletar o antigo (caso raro mas possível)
              if (actualData.id && actualData.id !== id) {
                console.log(`🔄 [${storeName}] ID mudou de ${id} para ${actualData.id} após UPDATE, removendo duplicata`);
                try {
                  await offlineStorage.delete(storeName, id);
                } catch (e) {
                  console.warn('⚠️ Não foi possível deletar item antigo:', e);
                }
              }
              
              await offlineStorage.save(storeName, {
                ...actualData,
                _synced: true
              });
              console.log(`✅ [${storeName}] Item sincronizado:`, actualData.id || id);
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
      console.log(`🗑️ [${storeName}] INICIANDO DELEÇÃO - ID:`, id);
      
      // 1. LIMPAR TODAS AS OPERAÇÕES PENDENTES DESTE ITEM DA FILA
      console.log(`🧹 [${storeName}] Limpando TODAS as operações pendentes do item ${id}...`);
      const queue = await offlineStorage.getSyncQueue();
      const filteredQueue = queue.filter(item => {
        // Remover CREATE, UPDATE e DELETE desta tarefa
        const isSameItem = String(item.data?.id) === String(id);
        if (isSameItem) {
          console.log(`   🗑️ Removendo operação ${item.type} do item ${id} da fila`);
        }
        return !isSameItem;
      });
      await offlineStorage.saveSyncQueue(filteredQueue);
      console.log(`✅ [${storeName}] Fila limpa - ${queue.length - filteredQueue.length} operações removidas`);
      
      // 2. Deletar localmente do IndexedDB
      await offlineStorage.delete(storeName, id);
      console.log(`💾 [${storeName}] Item removido do IndexedDB:`, id);

      // 3. Se online, deletar do servidor IMEDIATAMENTE
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
          } else if (response.status === 404) {
            // Item já não existe no servidor - OK, apenas remover do cache
            console.log(`✅ [${storeName}] Item ${id} já estava deletado no servidor (404 - OK)`);
          } else {
            console.error(`❌ [${storeName}] Servidor retornou ${response.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ [${storeName}] Erro ao sincronizar remoção:`, error);
        }
      } else {
        // Se offline, adicionar DELETE à fila
        await offlineStorage.addToSyncQueue({
          type: 'DELETE',
          storeName,
          endpoint,
          data: { id }
        });
        console.log(`📋 [${storeName}] DELETE adicionado à fila (offline)`);
      }
      
      console.log(`✅ [${storeName}] DELEÇÃO CONCLUÍDA - ID:`, id);
    },
    onSuccess: async (_, id) => {
      console.log(`🔄 [${storeName}] Invalidando e recarregando cache...`);
      
      // Invalidar cache
      await queryClient.invalidateQueries({ queryKey });
      
      // Forçar refetch imediato
      await queryClient.refetchQueries({ queryKey, type: 'active' });
      
      console.log(`✅ [${storeName}] Cache atualizado após deleção`);
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
    data: sortedData || [], // Usa dados sem duplicatas e ordenados por data de criação
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


