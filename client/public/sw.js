// Service Worker para notificações push
const CACHE_NAME = '7care-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/browserconfig.xml',
  '/favicon.ico',
  '/placeholder.svg',
  '/robots.txt'
];

// Assets dinâmicos que serão cacheados sob demanda
const DYNAMIC_CACHE_NAME = '7care-dynamic-v3';
const ROUTES_TO_CACHE = [
  '/dashboard',
  '/users',
  '/calendar',
  '/tasks',
  '/gamification',
  '/settings',
  '/meu-cadastro',
  '/chat',
  '/prayers',
  '/my-interested',
  '/elections',
  '/election-config',
  '/election-voting',
  '/election-results',
  '/election-dashboard',
  '/election-manage',
  '/push-notifications',
  '/contact'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    Promise.all([
      // Cache assets estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Service Worker: Cacheando assets estáticos...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache dinâmico para rotas
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('📦 Service Worker: Cacheando rotas dinâmicas...');
        // Cachear index.html para todas as rotas
        return cache.add('/index.html');
      }),
      // Cache das rotas principais
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('📦 Service Worker: Cacheando páginas principais...');
        return Promise.all(
          ROUTES_TO_CACHE.map(route => 
            fetch(route, {
              method: 'GET',
              headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
              }
            })
            .then(response => {
              if (response.ok) {
                return cache.put(route, response);
              }
              console.log(`⚠️ SW: Página não encontrada: ${route}`);
            })
            .catch(error => {
              console.log(`❌ SW: Erro ao cachear ${route}:`, error.message);
            })
          )
        );
      })
    ])
    .then(() => {
      console.log('✅ Service Worker: Instalação concluída');
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
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
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

  // Para requisições de assets, tentar cache primeiro
  if (isAssetFile(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('📦 Asset do cache:', event.request.url);
          return response;
        }
        
        // Se não está no cache, tenta fetch
        return fetch(event.request)
          .then((fetchResponse) => {
            // Verifica se a resposta é válida
            if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
              // Cacheia a resposta para uso futuro
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('💾 Asset cacheado:', event.request.url);
              }).catch((error) => {
                console.warn('⚠️ Erro ao cachear asset:', error);
              });
            }
            return fetchResponse;
          })
          .catch((error) => {
            console.warn('⚠️ Asset não encontrado:', event.request.url, error.message);
            return new Response('Asset not found', { 
              status: 404, 
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível
        if (response) {
          console.log('📦 Cache hit:', event.request.url);
          return response;
        }
        
        // Senão, faz a requisição
        return fetch(event.request)
          .then((fetchResponse) => {
            // Verifica se a resposta é válida e pode ser cacheada
            if (!fetchResponse || 
                fetchResponse.status !== 200 || 
                fetchResponse.type !== 'basic' ||
                event.request.method !== 'GET') {
              return fetchResponse;
            }

            // Clona a resposta para cache
            const responseToCache = fetchResponse.clone();

            // Determina qual cache usar baseado no tipo de recurso
            const cacheName = isAssetFile(event.request.url) ? CACHE_NAME : DYNAMIC_CACHE_NAME;

            // Adiciona ao cache para uso futuro (com tratamento de erro)
            caches.open(cacheName)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                  console.log('💾 Cacheado:', event.request.url, 'em', cacheName);
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
            console.warn('⚠️ Service Worker: Erro na requisição:', event.request.url, error.message);
            
            // Para páginas (não assets), tentar servir index.html do cache
            if (event.request.destination === 'document' && !isAssetFile(event.request.url)) {
              return caches.match('/index.html').then((response) => {
                if (response) {
                  console.log('📦 Servindo index.html do cache para rota:', event.request.url);
                  return response;
                }
                
                // Se não há index.html no cache, retornar página offline
                const offlineHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - 7care</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      text-align: center; 
      padding: 50px 20px; 
      margin: 0;
      background: #f5f5f5;
    }
    .offline-container { 
      max-width: 400px; 
      margin: 0 auto; 
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .offline-icon { 
      font-size: 64px; 
      margin-bottom: 20px; 
    }
    h1 { color: #333; margin-bottom: 10px; }
    p { color: #666; margin-bottom: 30px; }
    button { 
      background: #007bff; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 6px; 
      cursor: pointer; 
      font-size: 16px;
    }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📱</div>
    <h1>Modo Offline</h1>
    <p>Você está offline. Algumas funcionalidades podem estar limitadas.</p>
    <button onclick="window.location.reload()">Tentar Novamente</button>
  </div>
</body>
</html>`;
                
                return new Response(offlineHTML, {
                  status: 200,
                  statusText: 'OK',
                  headers: { 
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache'
                  }
                });
              });
            }
            
            // Para assets, retornar resposta 404 em vez de erro
            if (isAssetFile(event.request.url)) {
              return new Response('Asset not found', { 
                status: 404, 
                statusText: 'Not Found',
                headers: { 
                  'Content-Type': 'text/plain; charset=utf-8',
                  'Cache-Control': 'no-cache'
                }
              });
            }
            
            // Para outros recursos, retornar resposta de erro
            return new Response('Resource not available', { 
              status: 408, 
              statusText: 'Request Timeout',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
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
  
  // Cachear assets dinamicamente quando solicitado
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    const assets = event.data.assets || [];
    if (assets.length > 0) {
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(assets);
      }).then(() => {
        console.log('✅ Assets adicionais cacheados:', assets.length);
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        console.error('❌ Erro ao cachear assets adicionais:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      });
    }
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

// Função para determinar se é um arquivo de asset
function isAssetFile(url) {
  const assetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  return assetExtensions.some(ext => url.includes(ext));
}

console.log('🚀 Service Worker: Carregado e pronto!');
