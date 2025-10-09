/**
 * 🔄 INTERCEPTOR DE API COM CACHE DE DADOS
 * 
 * Intercepta chamadas à API e cacheia dados no IndexedDB
 * Serve dados do cache quando offline
 */

import { offlineDB } from './offlineDatabase';

// Mapeamento de endpoints para stores do IndexedDB
const ENDPOINT_TO_STORE: Record<string, string> = {
  '/api/users': 'users',
  '/api/tasks': 'tasks',
  '/api/interested': 'interested',
  '/api/events': 'events',
  '/api/prayers': 'prayers',
  '/api/activities': 'activities',
  '/api/churches': 'churches'
};

// Função para obter nome do store baseado na URL
function getStoreFromUrl(url: string): string | null {
  for (const [endpoint, store] of Object.entries(ENDPOINT_TO_STORE)) {
    if (url.includes(endpoint)) {
      return store;
    }
  }
  return null;
}

// Fetch com cache offline
export async function fetchWithOfflineCache(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  const storeName = getStoreFromUrl(url);

  // Se não for GET ou não tiver store mapeado, fazer requisição normal
  if (method !== 'GET' || !storeName) {
    try {
      const response = await fetch(url, options);
      
      // Se for POST/PUT/DELETE bem-sucedido e tiver body, cachear
      if (response.ok && (method === 'POST' || method === 'PUT')) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        if (data && storeName) {
          await offlineDB.save(storeName, data);
        }
      }
      
      return response;
    } catch (error) {
      // Se offline e for mutação, adicionar à fila
      if (!navigator.onLine && storeName && options.body) {
        const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        await offlineDB.addToSyncQueue(method.toLowerCase(), storeName, bodyData);
        
        // Retornar resposta de sucesso simulada
        return new Response(JSON.stringify({ success: true, offline: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      throw error;
    }
  }

  // GET: Tentar rede primeiro, cachear resultado
  try {
    console.log(`🌐 Buscando da API: ${url}`);
    const response = await fetch(url, options);

    if (response.ok) {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();

      // Cachear dados no IndexedDB
      if (data && storeName) {
        await offlineDB.save(storeName, data);
        console.log(`💾 Dados cacheados em IndexedDB: ${storeName} (${Array.isArray(data) ? data.length : 1} itens)`);
        
        // Salvar timestamp da última sincronização
        await offlineDB.saveMetadata(`last_sync_${storeName}`, new Date().toISOString());
      }
    }

    return response;
  } catch (error) {
    // Offline ou erro de rede - buscar do IndexedDB
    console.log(`📡 OFFLINE - Buscando do IndexedDB: ${storeName}`);

    if (storeName) {
      const cachedData = await offlineDB.getAll(storeName);

      if (cachedData && cachedData.length > 0) {
        console.log(`✅ ${cachedData.length} itens do cache: ${storeName}`);
        
        // Retornar dados do cache como se fosse resposta da API
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cached': 'true',
            'X-Cache-Source': 'IndexedDB'
          }
        });
      } else {
        console.warn(`⚠️ Sem dados em cache: ${storeName}`);
      }
    }

    // Se não tiver cache, retornar array vazio
    console.warn(`⚠️ Retornando array vazio para: ${url}`);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cached': 'false'
      }
    });
  }
}

// Interceptar fetch global
export function setupOfflineInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Se for requisição da API, usar interceptor
    if (url.includes('/api/')) {
      return fetchWithOfflineCache(url, init || {});
    }

    // Caso contrário, usar fetch normal
    return originalFetch(input, init);
  };

  console.log('✅ Interceptor de API offline configurado');
}

// Sincronizar dados quando voltar online
export async function syncWhenOnline() {
  if (!navigator.onLine) {
    console.log('📡 Ainda offline, sincronização pendente');
    return 0;
  }

  console.log('🔄 Iniciando sincronização...');
  const synced = await offlineDB.processSyncQueue();
  
  if (synced > 0) {
    console.log(`✅ ${synced} itens sincronizados com sucesso!`);
  }

  return synced;
}

// Listener para sincronizar ao voltar online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Internet restaurada - iniciando sincronização');
    syncWhenOnline().catch(err => {
      console.error('❌ Erro na sincronização:', err);
    });
  });
}

// Download de dados para instalação offline completa
export async function downloadAllDataForOffline(): Promise<void> {
  if (!navigator.onLine) {
    throw new Error('É necessário estar online para baixar os dados');
  }

  console.log('📥 Baixando todos os dados para uso offline...');

  const endpoints = Object.keys(ENDPOINT_TO_STORE);
  let totalDownloaded = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const storeName = ENDPOINT_TO_STORE[endpoint];
        
        await offlineDB.save(storeName, data);
        totalDownloaded += Array.isArray(data) ? data.length : 1;
        
        console.log(`✅ ${storeName}: ${Array.isArray(data) ? data.length : 1} itens`);
      }
    } catch (error) {
      console.error(`❌ Erro ao baixar ${endpoint}:`, error);
    }
  }

  // Salvar timestamp do download completo
  await offlineDB.saveMetadata('full_download_timestamp', new Date().toISOString());
  
  console.log(`✅ Download completo! ${totalDownloaded} itens salvos no IndexedDB`);
}

// Verificar se dados estão atualizados
export async function checkDataFreshness(): Promise<{
  isStale: boolean;
  lastSync: string | null;
  stats: Record<string, number>;
}> {
  const lastDownload = await offlineDB.getMetadata('full_download_timestamp');
  const stats = await offlineDB.getStats();

  // Considerar stale se passou mais de 24 horas
  const isStale = lastDownload 
    ? (Date.now() - new Date(lastDownload).getTime()) > 24 * 60 * 60 * 1000
    : true;

  return {
    isStale,
    lastSync: lastDownload,
    stats
  };
}

