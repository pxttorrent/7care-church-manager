/**
 * 🔄 INTERCEPTOR DE REQUISIÇÕES OFFLINE
 * 
 * Intercepta fetch() globalmente e adiciona à fila quando offline
 */

const SYNC_QUEUE_KEY = 'offline-sync-queue';

// Salvar fetch original
const originalFetch = window.fetch;

// Flag para verificar se interceptor está ativo
let interceptorActive = false;

/**
 * Ativar interceptor de requisições offline
 */
export function enableOfflineInterceptor(isAdmin: boolean) {
  if (!isAdmin || interceptorActive) return;
  
  interceptorActive = true;
  console.log('✅ Interceptor offline ativado');

  // Sobrescrever fetch global
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';

    // Se é requisição de API e NÃO é GET
    const isAPI = url.includes('/api/');
    const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());

    // Se está online ou não é API de escrita, usar fetch normal
    if (navigator.onLine || !isAPI || !isWrite) {
      return originalFetch(...args);
    }

    // Está offline e tentando fazer operação de escrita - adicionar à fila
    console.log('📥 Offline: Adicionando à fila:', method, url);

    const item = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method: method.toUpperCase(),
      endpoint: url,
      data: init?.body ? JSON.parse(init.body as string) : undefined,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    // Adicionar à fila
    try {
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
      queue.push(item);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

      // Disparar evento para atualizar badge
      window.dispatchEvent(new CustomEvent('offlineQueueUpdated'));

      // Retornar resposta simulada de sucesso
      return new Response(
        JSON.stringify({ 
          success: true, 
          queued: true,
          offline: true,
          message: 'Ação salva. Será sincronizada quando voltar online.',
          queuedItemId: item.id
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error);
      throw error;
    }
  };
}

/**
 * Desativar interceptor
 */
export function disableOfflineInterceptor() {
  if (!interceptorActive) return;
  
  window.fetch = originalFetch;
  interceptorActive = false;
  console.log('⛔ Interceptor offline desativado');
}

/**
 * Verificar se interceptor está ativo
 */
export function isInterceptorActive(): boolean {
  return interceptorActive;
}

