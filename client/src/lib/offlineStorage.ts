/**
 * 💾 ARMAZENAMENTO OFFLINE PERSISTENTE
 * 
 * Sistema de download e armazenamento completo de dados
 * Usa IndexedDB para armazenamento robusto e persistente
 */

const DB_NAME = '7care-offline-storage';
const DB_VERSION = 1;

// Stores de dados
const STORES = {
  USERS: 'users',
  EVENTS: 'events',
  TASKS: 'tasks',
  PRAYERS: 'prayers',
  RELATIONSHIPS: 'relationships',
  MEETINGS: 'meetings',
  INTERESTED: 'interested',
  DASHBOARD_STATS: 'dashboard_stats',
  METADATA: 'metadata' // Info sobre último download
};

/**
 * Abrir banco de dados
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Criar stores se não existirem
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
  });
}

/**
 * Salvar dados em store
 */
async function saveToStore(storeName: string, data: any[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Limpar store antes de salvar novos dados
  await new Promise((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve(undefined);
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Adicionar todos os dados
  for (const item of data) {
    await new Promise((resolve, reject) => {
      const addRequest = store.add(item);
      addRequest.onsuccess = () => resolve(undefined);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  db.close();
}

/**
 * Buscar dados do store
 */
async function getFromStore<T = any>(storeName: string): Promise<T[]> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Download completo de dados do servidor + TODAS as páginas
 */
export async function downloadAllData(onProgress?: (progress: number, message: string) => void): Promise<void> {
  // Lista de endpoints de API para baixar
  const endpoints = [
    { name: 'Usuários', endpoint: '/api/users', store: STORES.USERS },
    { name: 'Eventos', endpoint: '/api/events', store: STORES.EVENTS },
    { name: 'Tarefas', endpoint: '/api/tasks', store: STORES.TASKS },
    { name: 'Orações', endpoint: '/api/prayers', store: STORES.PRAYERS },
    { name: 'Relacionamentos', endpoint: '/api/relationships', store: STORES.RELATIONSHIPS },
    { name: 'Reuniões', endpoint: '/api/meetings', store: STORES.MEETINGS },
    { name: 'Interessados', endpoint: '/api/interested', store: STORES.INTERESTED },
    { name: 'Dashboard', endpoint: '/api/dashboard/stats', store: STORES.DASHBOARD_STATS },
    { name: 'Visitas', endpoint: '/api/dashboard/visits', store: 'dashboard_visits' },
    { name: 'Aniversários', endpoint: '/api/users/birthdays', store: 'birthdays' },
    { name: 'Check-ins Emocionais', endpoint: '/api/emotional-checkins/admin', store: 'emotional_checkins' },
  ];

  // Lista de TODAS as páginas do app para pré-carregar
  const pagesToPreload = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Usuários', url: '/users' },
    { name: 'Calendário', url: '/calendar' },
    { name: 'Tarefas', url: '/tasks' },
    { name: 'Orações', url: '/prayers' },
    { name: 'Chat', url: '/chat' },
    { name: 'Interessados', url: '/interested' },
    { name: 'Meus Interessados', url: '/my-interested' },
    { name: 'Gamificação', url: '/gamification' },
    { name: 'Relatórios', url: '/reports' },
    { name: 'Configurações', url: '/settings' },
    { name: 'Notificações', url: '/notifications' },
  ];

  const totalSteps = endpoints.length + pagesToPreload.length;
  let currentStep = 0;

  // PASSO 1: Baixar e salvar dados de APIs
  for (const { name, endpoint, store } of endpoints) {
    try {
      onProgress?.(Math.round((currentStep / totalSteps) * 100), `Baixando ${name}...`);

      const response = await fetch(endpoint, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Garantir que é array
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Salvar no IndexedDB
      await saveToStore(store, dataArray);
      
      console.log(`✅ ${name} baixado e salvo:`, dataArray.length, 'itens');
      currentStep++;
      
    } catch (error) {
      console.error(`❌ Erro ao baixar ${name}:`, error);
      currentStep++;
    }
  }

  // PASSO 2: Pré-carregar TODAS as páginas (para Service Worker cachear)
  for (const { name, url } of pagesToPreload) {
    try {
      onProgress?.(Math.round((currentStep / totalSteps) * 100), `Carregando página ${name}...`);

      // Fazer requisição para a página para Service Worker cachear
      await fetch(url, { credentials: 'include' }).catch(() => {
        // Ignorar erros de fetch de páginas
      });
      
      console.log(`✅ Página ${name} pré-carregada`);
      currentStep++;
      
    } catch (error) {
      console.error(`❌ Erro ao pré-carregar ${name}:`, error);
      currentStep++;
    }

    // Pequeno delay para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Salvar metadata do download
  const metadata = {
    id: 1,
    downloadedAt: new Date().toISOString(),
    version: 1,
    totalEndpoints: endpoints.length,
    totalPages: pagesToPreload.length,
    totalItems: currentStep
  };
  await saveToStore(STORES.METADATA, [metadata]);

  onProgress?.(100, 'Download concluído!');
  
  // Marcar como baixado
  localStorage.setItem('offline-data-downloaded', 'true');
  localStorage.setItem('offline-data-downloaded-at', metadata.downloadedAt);
  localStorage.setItem('offline-total-pages', pagesToPreload.length.toString());
  localStorage.setItem('offline-total-apis', endpoints.length.toString());
  
  console.log('✅ Download completo finalizado!', {
    apis: endpoints.length,
    pages: pagesToPreload.length,
    total: currentStep
  });
}

/**
 * Buscar dados offline
 */
export async function getOfflineData<T = any>(type: 'users' | 'events' | 'tasks' | 'prayers' | 'relationships' | 'meetings' | 'interested' | 'dashboard'): Promise<T[]> {
  const storeMap: Record<string, string> = {
    users: STORES.USERS,
    events: STORES.EVENTS,
    tasks: STORES.TASKS,
    prayers: STORES.PRAYERS,
    relationships: STORES.RELATIONSHIPS,
    meetings: STORES.MEETINGS,
    interested: STORES.INTERESTED,
    dashboard: STORES.DASHBOARD_STATS
  };

  const storeName = storeMap[type];
  if (!storeName) {
    console.error('Tipo inválido:', type);
    return [];
  }

  try {
    return await getFromStore<T>(storeName);
  } catch (error) {
    console.error('Erro ao buscar dados offline:', error);
    return [];
  }
}

/**
 * Verificar se dados foram baixados
 */
export function isDataDownloaded(): boolean {
  return localStorage.getItem('offline-data-downloaded') === 'true';
}

/**
 * Obter informações do último download
 */
export function getDownloadInfo(): { downloadedAt: string | null; hasData: boolean } {
  return {
    downloadedAt: localStorage.getItem('offline-data-downloaded-at'),
    hasData: isDataDownloaded()
  };
}

/**
 * Limpar dados offline
 */
export async function clearOfflineData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      localStorage.removeItem('offline-data-downloaded');
      localStorage.removeItem('offline-data-downloaded-at');
      console.log('🗑️ Dados offline limpos');
      resolve();
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * Calcular tamanho aproximado dos dados
 */
export async function getStorageSize(): Promise<number> {
  if (!('estimate' in navigator.storage)) {
    return 0;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  } catch {
    return 0;
  }
}

