// Service Worker para notificações push
const CACHE_NAME = '7care-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache aberto');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro ao cachear assets:', error);
      })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');
  event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
    })
  );
  // Toma controle imediato
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Filtrar requisições que não devem ser cacheadas
  const url = new URL(event.request.url);
  
  // Não cachear APIs, chrome-extensions, ou outros esquemas não suportados
  if (
    event.request.url.includes('/api/') ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'chrome:' ||
    url.protocol === 'moz-extension:' ||
    url.protocol === 'edge-extension:' ||
    url.protocol === 'safari-extension:' ||
    url.protocol === 'data:' ||
    url.protocol === 'blob:' ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  // Só interceptar requisições do mesmo domínio
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        
        // Senão, faz a requisição
        return fetch(event.request)
          .then((fetchResponse) => {
            // Verifica se a resposta é válida e pode ser cacheada
            if (!fetchResponse || 
                fetchResponse.status !== 200 || 
                fetchResponse.type !== 'basic' ||
                !fetchResponse.headers.get('content-type')?.includes('text') ||
                event.request.method !== 'GET') {
              return fetchResponse;
            }

            // Clona a resposta para cache
            const responseToCache = fetchResponse.clone();

            // Adiciona ao cache para uso futuro (com tratamento de erro)
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('⚠️ Service Worker: Erro ao salvar no cache:', error);
                }
              })
              .catch((error) => {
                console.warn('⚠️ Service Worker: Erro ao abrir cache:', error);
              });

            return fetchResponse;
          })
          .catch((error) => {
            console.error('❌ Service Worker: Erro na requisição:', error);
            
            // Retorna uma resposta de erro personalizada para páginas
            if (event.request.destination === 'document') {
              return new Response(
                `<!DOCTYPE html>
                <html>
                  <head>
                    <title>Erro de Conexão - 7care</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                  </head>
                  <body>
                    <h1>Sem conexão</h1>
                    <p>Verifique sua internet e tente novamente.</p>
                    <button onclick="window.location.reload()">Tentar Novamente</button>
                  </body>
                </html>`,
                {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            }
            
            // Para outros recursos, re-lança o erro
            throw error;
          });
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro geral na requisição:', error);
        // Retorna erro para não quebrar a aplicação
        return new Response('Erro de rede', { status: 408 });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification recebida');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '7care', body: event.data.text() };
    }
  }
  
  const options = {
    title: data.title || '7care',
    body: data.message || data.body || 'Nova notificação',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.type || 'general',
    data: data,
    requireInteraction: data.type === 'urgent',
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Click em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notificação clicada');
  
  event.notification.close();
    
    if (event.action === 'close') {
      return;
    }
    
  // Abrir o app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
        // Senão, abrir nova janela
          if (clients.openWindow) {
          return clients.openWindow('/dashboard');
          }
        })
    );
});

// Background sync (se suportado)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineData()
    );
  }
  
  if (event.tag === 'sync-users') {
    event.waitUntil(
      syncSpecificData('users')
    );
  }
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      syncSpecificData('tasks')
    );
  }
  
  if (event.tag === 'sync-calendar') {
    event.waitUntil(
      syncSpecificData('calendar')
    );
  }
});

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    console.log('🔄 Service Worker: Iniciando sincronização offline...');
    
    // Verificar se há dados para sincronizar
    const offlineData = await getOfflineData();
    
    if (!offlineData || offlineData.length === 0) {
      console.log('📭 Service Worker: Nenhum dado offline para sincronizar');
      return;
    }
    
    console.log(`📊 Service Worker: ${offlineData.length} operações offline encontradas`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Processar cada operação offline
    for (const operation of offlineData) {
      try {
        await processOfflineOperation(operation);
        successCount++;
        console.log(`✅ Service Worker: Operação sincronizada: ${operation.type} ${operation.endpoint}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Service Worker: Erro na sincronização:`, error);
        
        // Se falhou, atualizar contador de tentativas
        await updateOperationRetryCount(operation.id, error);
      }
    }
    
    console.log(`📈 Service Worker: Sincronização concluída: ${successCount} sucessos, ${errorCount} falhas`);
    
    // Notificar o cliente sobre o resultado
    await notifyClients({
      type: 'sync-completed',
      success: successCount,
      errors: errorCount,
      total: offlineData.length
    });
    
  } catch (error) {
    console.error('❌ Service Worker: Erro na sincronização offline:', error);
    
    // Notificar o cliente sobre o erro
    await notifyClients({
      type: 'sync-error',
      error: error.message
    });
  }
}

// Função para sincronizar dados específicos
async function syncSpecificData(type) {
  try {
    console.log(`🔄 Service Worker: Sincronizando ${type}...`);
    
    const offlineData = await getOfflineDataByType(type);
    
    if (!offlineData || offlineData.length === 0) {
      console.log(`📭 Service Worker: Nenhum dado ${type} para sincronizar`);
      return;
    }
    
    for (const operation of offlineData) {
      await processOfflineOperation(operation);
    }
    
    console.log(`✅ Service Worker: ${type} sincronizado com sucesso`);
    
  } catch (error) {
    console.error(`❌ Service Worker: Erro na sincronização de ${type}:`, error);
  }
}

// Função para processar uma operação offline
async function processOfflineOperation(operation) {
  const options = {
    method: operation.method,
    headers: {
      'Content-Type': 'application/json',
      ...operation.headers
    }
  };
  
  if (operation.data && ['POST', 'PUT'].includes(operation.method)) {
    options.body = JSON.stringify(operation.data);
  }
  
  const response = await fetch(operation.endpoint, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  // Remover operação da fila offline após sucesso
  await removeOfflineOperation(operation.id);
  
  return response;
}

// Função para obter dados offline do IndexedDB
async function getOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('7care-offline-queue', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Função para obter dados offline por tipo
async function getOfflineDataByType(type) {
  const allData = await getOfflineData();
  return allData.filter(operation => 
    operation.endpoint.includes(`/${type}`) || 
    operation.metadata?.category === type
  );
}

// Função para remover operação offline
async function removeOfflineOperation(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('7care-offline-queue', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Função para atualizar contador de tentativas
async function updateOperationRetryCount(id, error) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('7care-offline-queue', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          operation.retryCount = (operation.retryCount || 0) + 1;
          operation.lastError = error.message;
          operation.lastRetryTime = Date.now();
          
          // Se excedeu o máximo de tentativas, remover
          if (operation.retryCount >= (operation.maxRetries || 3)) {
            store.delete(id);
          } else {
            store.put(operation);
          }
        }
        resolve();
      };
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Função para notificar clientes
async function notifyClients(data) {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(data);
    });
  } catch (error) {
    console.error('❌ Service Worker: Erro ao notificar clientes:', error);
  }
}

// Message handling
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensagem recebida:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
  }
});

// Suprimir erros de Chrome Extensions
self.addEventListener('error', (event) => {
  if (event.message && event.message.includes('chrome-extension')) {
    event.preventDefault();
    return;
  }
});

self.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('chrome-extension')) {
    event.preventDefault();
    return;
  }
});

console.log('🚀 Service Worker: Carregado e pronto!');
