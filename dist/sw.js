// Service Worker for 7care PWA - v28 com Offline Sync
const CACHE_NAME = '7care-v28-precache-total';
const API_CACHE_NAME = '7care-api-v28';
const SYNC_DB_NAME = '7care-sync-db';
const SYNC_STORE_NAME = 'sync-queue';
const LOCAL_DATA_STORE = 'local-data';

// ========== FUNÇÕES DE SINCRONIZAÇÃO OFFLINE ==========

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, 2); // v2 para adicionar local-data store
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store de fila de sincronização
      if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
        const store = db.createObjectStore(SYNC_STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store de dados locais (itens criados offline)
      if (!db.objectStoreNames.contains(LOCAL_DATA_STORE)) {
        const dataStore = db.createObjectStore(LOCAL_DATA_STORE, { 
          keyPath: 'id'
        });
        dataStore.createIndex('endpoint', 'endpoint', { unique: false });
        dataStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function addToSyncQueue(db, item) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    
    const queueItem = {
      ...item,
      status: 'pending',
      retries: 0
    };
    
    const request = store.add(queueItem);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Importar manifest de assets (será gerado no build)
let OFFLINE_ASSETS = [];

// Tentar carregar manifest de assets
try {
  importScripts('/sw-manifest.js');
  OFFLINE_ASSETS = self.OFFLINE_ASSETS || [];
  console.log(`📦 SW v28: Manifest carregado - ${OFFLINE_ASSETS.length} assets`);
} catch (e) {
  console.warn('⚠️ SW v28: Manifest não encontrado, usando lista essencial');
}

// URLs essenciais para cache inicial (fallback)
const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/favicon.ico',
  '/7care-logo.png',
  '/7carelogonew.png'
];

// Rotas da aplicação (SPA)
const APP_ROUTES = [
  '/dashboard',
  '/menu',
  '/calendar',
  '/users',
  '/tasks',
  '/interested',
  '/my-interested',
  '/chat',
  '/settings',
  '/gamification',
  '/prayers',
  '/push-notifications',
  '/notifications',
  '/contact',
  '/meu-cadastro',
  '/elections',
  '/election-config',
  '/election-voting',
  '/election-dashboard',
  '/election-manage',
  '/first-access',
  '/login'
];

// Install event - Pre-cache TODOS os assets do manifest
self.addEventListener('install', (event) => {
  console.log('🔄 SW v28: Instalando Service Worker...', CACHE_NAME);
  console.log(`📦 SW v28: Preparando para cachear ${OFFLINE_ASSETS.length} assets`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('💾 SW v28: Iniciando pre-cache completo...');
        
        try {
          // Usar manifest se disponível, senão usar essenciais
          const assetsToCash = OFFLINE_ASSETS.length > 0 ? OFFLINE_ASSETS : ESSENTIAL_URLS;
          
          console.log(`📥 SW v28: Cacheando ${assetsToCash.length} assets...`);
          
          // Dividir em lotes para não sobrecarregar
          const BATCH_SIZE = 20;
          let cached = 0;
          
          for (let i = 0; i < assetsToCash.length; i += BATCH_SIZE) {
            const batch = assetsToCash.slice(i, i + BATCH_SIZE);
            
            await Promise.allSettled(
              batch.map(url => 
                fetch(url, { cache: 'reload' })
                  .then(response => {
                    if (response && response.ok) {
                      cache.put(url, response);
                      cached++;
                      
                      // Log progresso a cada 20 assets
                      if (cached % 20 === 0) {
                        const progress = Math.round((cached / assetsToCash.length) * 100);
                        console.log(`⏳ SW v28: Progresso ${progress}% (${cached}/${assetsToCash.length})`);
                      }
                    }
                  })
                  .catch(err => console.warn(`⚠️ Falha: ${url}`))
              )
            );
          }
          
          console.log(`✅ SW v28: Pre-cache completo! ${cached}/${assetsToCash.length} assets cacheados`);
          console.log('🎉 SW v28: App 100% pronto para offline!');
        } catch (err) {
          console.error('❌ SW v28: Erro no pre-cache:', err);
        }
      })
  );
  
  self.skipWaiting();
});

// Activate event - Limpar caches antigos e ativar
self.addEventListener('activate', (event) => {
  console.log('🚀 SW v28: Ativando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('🗑️ SW v28: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediatamente de todas as páginas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW v28: Service Worker ativado e controlando todas as páginas');
      console.log('🎉 SW v28: Aplicação pronta para funcionar offline!');
    })
  );
});

// Fetch event - Estratégia inteligente de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições de outros domínios
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Detectar tipo de recurso
  const isNavigate = event.request.mode === 'navigate';
  const isAPI = url.pathname.startsWith('/api/');
  const isAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp)$/i);
  const isGET = event.request.method === 'GET';
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method);

  event.respondWith(
    (async () => {
      // ========== NAVEGAÇÃO (Rotas SPA) ==========
      if (isNavigate) {
        try {
          // Tentar buscar da rede primeiro
          const networkResponse = await fetch(event.request);
          
          if (networkResponse && networkResponse.ok) {
            // Cachear a resposta
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            cache.put(url.pathname, networkResponse.clone());
            console.log(`📝 SW v28: Cached (navigate): ${url.pathname}`);
          }
          
          return networkResponse;
        } catch (error) {
          // Offline - SEMPRE retornar index.html para SPA
          console.log('📡 SW v28: OFFLINE - Modo SPA para:', url.pathname);
          
          // Para SPA, SEMPRE retornar index.html do cache
          // O React Router cuidará da navegação interna
          const indexResponse = await caches.match('/index.html');
          if (indexResponse) {
            console.log(`✅ SW v28: Servindo index.html para: ${url.pathname}`);
            return indexResponse;
          }
          
          // Fallback alternativo
          const rootResponse = await caches.match('/');
          if (rootResponse) {
            console.log(`✅ SW v28: Servindo / para: ${url.pathname}`);
            return rootResponse;
          }
          
          // Se realmente não tiver nada em cache
          console.error(`❌ SW v28: Sem index.html em cache!`);
          return new Response(
            '<!DOCTYPE html><html><body><h1>Offline</h1><p>O aplicativo está offline. Por favor, conecte-se à internet.</p></body></html>',
            {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'text/html' }
            }
          );
        }
      }

      // ========== API WRITE OPERATIONS (POST/PUT/PATCH/DELETE) OFFLINE ==========
      if (isAPI && isWrite) {
        try {
          // Tentar enviar pela rede
          const networkResponse = await fetch(event.request.clone());
          return networkResponse;
        } catch (error) {
          // OFFLINE - Salvar na fila de sincronização E nos dados locais
          console.log(`📝 SW v28: OFFLINE - Salvando operação para sincronizar: ${event.request.method} ${url.pathname}`);
          
          try {
            // Ler o body da requisição
            const requestClone = event.request.clone();
            const body = await requestClone.json().catch(() => null);
            
            // Abrir IndexedDB
            const db = await openSyncDB();
            
            // 1. Salvar na fila de sincronização
            await addToSyncQueue(db, {
              url: event.request.url,
              method: event.request.method,
              body: body,
              headers: Object.fromEntries(event.request.headers.entries()),
              timestamp: Date.now()
            });
            
            console.log(`✅ SW v28: Operação salva na fila de sincronização`);
            
            // 2. Se for POST (criar), salvar nos dados locais também
            if (event.request.method === 'POST' && body) {
              const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const localData = {
                ...body,
                id: tempId,
                _tempId: tempId,
                _pendingSync: true,
                _offlineCreated: true,
                createdAt: new Date().toISOString(),
                created_at: new Date().toISOString()
              };
              
              // Extrair endpoint base (sem query params e sem /api)
              const endpointBase = url.pathname;
              
              await saveLocalData(db, endpointBase, localData);
              console.log(`💾 SW v28: Dados locais salvos para ${endpointBase} com ID ${tempId}`);
              
              // Retornar resposta simulada com dados completos
              return new Response(JSON.stringify(localData), {
                status: 201,
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Offline-Created': 'true',
                  'X-Pending-Sync': 'true'
                }
              });
            }
            
            // Para PUT/PATCH/DELETE, retornar sucesso genérico
            return new Response(JSON.stringify({ 
              success: true,
              _pendingSync: true,
              message: 'Operação será sincronizada quando voltar online'
            }), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'X-Pending-Sync': 'true'
              }
            });
          } catch (dbError) {
            console.error('❌ SW v28: Erro ao salvar na fila:', dbError);
            
            // Retornar erro
            return new Response(JSON.stringify({ 
              error: 'Offline - operação não pôde ser salva',
              details: dbError.message
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }

      // ========== API (Network First com Cache Inteligente) ==========
      if (isAPI && isGET) {
        try {
          // Tentar buscar da rede
          const networkResponse = await fetch(event.request.clone());
          
          if (networkResponse && networkResponse.ok) {
            // Cachear SEMPRE respostas bem-sucedidas da API
            const cache = await caches.open(API_CACHE_NAME);
            
            // Cachear com URL completa (com query params)
            cache.put(event.request, networkResponse.clone());
            
            // TAMBÉM cachear sem query params para fallback
            const urlWithoutParams = url.origin + url.pathname;
            cache.put(new Request(urlWithoutParams), networkResponse.clone());
            
            console.log(`💾 SW v28: API cached: ${url.pathname}${url.search}`);
          }
          
          return networkResponse;
        } catch (error) {
          // OFFLINE - Buscar do cache de API
          console.log('📡 SW v28: OFFLINE - Buscando dados do cache:', url.pathname + url.search);
          
          // Tentar buscar com URL exata primeiro
          let cachedResponse = await caches.match(event.request);
          
          // Se não encontrar, tentar sem query params
          if (!cachedResponse) {
            const urlWithoutParams = url.origin + url.pathname;
            cachedResponse = await caches.match(urlWithoutParams);
            
            if (cachedResponse) {
              console.log(`✅ SW v28: Dados do cache (sem params): ${url.pathname}`);
            }
          }
          
          if (cachedResponse) {
            // Retornar dados do cache MESCLADOS com dados locais
            const clonedResponse = cachedResponse.clone();
            let data = await clonedResponse.json();
            
            console.log(`✅ SW v28: ${Array.isArray(data) ? data.length : 'N/A'} itens retornados do cache`);
            
            // Buscar dados locais pendentes para este endpoint
            try {
              const db = await openSyncDB();
              const localData = await getLocalDataByEndpoint(db, url.pathname);
              
              if (localData.length > 0) {
                console.log(`🔀 SW v28: Mesclando ${localData.length} itens locais com ${Array.isArray(data) ? data.length : 0} do cache`);
                
                // Mesclar: dados locais PRIMEIRO (são os mais recentes)
                if (Array.isArray(data)) {
                  data = [...localData, ...data];
                  console.log(`✅ SW v28: Total após mesclagem: ${data.length} itens`);
                }
              }
            } catch (mergeError) {
              console.warn('⚠️ SW v28: Erro ao mesclar dados locais:', mergeError);
              // Continuar com dados do cache apenas
            }
            
            // Adicionar header indicando que veio do cache
            return new Response(JSON.stringify(data), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'X-Cached': 'true',
                'X-Has-Local-Data': 'check',
                'X-Cache-Time': cachedResponse.headers.get('date') || 'unknown'
              }
            });
          }
          
          // Se realmente não tiver nada em cache, retornar array vazio
          console.warn(`⚠️ SW v28: Sem dados em cache para: ${url.pathname}`);
          return new Response(
            JSON.stringify([]), 
            { 
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'X-Cached': 'false'
              }
            }
          );
        }
      }

      // ========== ASSETS (Cache First com Auto-Cache) ==========
      if (isAsset && isGET) {
        // Tentar do cache primeiro
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log(`⚡ Cache hit (asset): ${url.pathname}`);
          return cachedResponse;
        }
        
        try {
          // Buscar da rede e cachear automaticamente
          const networkResponse = await fetch(event.request);
          
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            console.log(`📦 SW v28: Asset cached: ${url.pathname}`);
          }
          
          return networkResponse;
        } catch (error) {
          console.error(`❌ SW v28: Asset não disponível offline: ${url.pathname}`);
          
          // Para imagens, retornar placeholder
          if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
            return new Response('', { 
              status: 404,
              statusText: 'Image not available offline'
            });
          }
          
          return new Response('', { status: 503 });
        }
      }

      // ========== OUTROS (Network First) ==========
      try {
        const networkResponse = await fetch(event.request);
        
        if (networkResponse && networkResponse.ok && isGET) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
          console.log(`📦 SW v28: Cached (other): ${url.pathname}`);
        }
        
        return networkResponse;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log(`✅ Cache hit (other): ${url.pathname}`);
          return cachedResponse;
        }
        
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Push event - VERSÃO COM HISTÓRICO
self.addEventListener('push', (event) => {
  console.log('📱 SW v28: Push event recebido');
  
  const extractCleanMessage = (data) => {
    if (!data || data.trim() === '') {
      return 'Nova notificação';
    }
    
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        
        if (parsed.message) {
          return String(parsed.message);
        }
        
        if (parsed.title) {
          return String(parsed.title);
        }
        
        return 'Nova notificação do 7care';
      } catch (e) {
        console.log('⚠️ SW v28: JSON inválido, limpando texto');
        return trimmed.replace(/[{}[\]"]/g, '').substring(0, 200) || 'Nova notificação';
      }
    }
    
    return trimmed.substring(0, 200);
  };
  
  let title = '7care';
  let message = 'Nova notificação';
  let iconUrl = '/pwa-192x192.png';
  let audioData = null;
  let hasAudio = false;
  let imageData = null;
  let hasImage = false;
  let notificationType = 'general';
  
  try {
    if (event.data) {
      const rawText = event.data.text();
      console.log('📦 SW v28: Raw text recebido (primeiros 150 chars):', rawText.substring(0, 150));
      
      let parsed = null;
      let isJSON = false;
      
      try {
        parsed = JSON.parse(rawText);
        isJSON = true;
        console.log('✅ SW v28: JSON parseado com sucesso');
      } catch (e) {
        console.log('ℹ️ SW v28: Não é JSON, usando texto simples');
      }
      
      if (isJSON && parsed) {
        title = parsed.title || '7care';
        message = parsed.message || 'Nova notificação';
        
        if (parsed.image && typeof parsed.image === 'string' && parsed.image.startsWith('data:image')) {
          iconUrl = parsed.image;
          imageData = parsed.image;
          hasImage = true;
          console.log('📷 SW v28: Imagem detectada e salva');
        }
        
        if (parsed.audio && typeof parsed.audio === 'string' && parsed.audio.startsWith('data:audio')) {
          audioData = parsed.audio;
          hasAudio = true;
          console.log('🎵 SW v28: Áudio detectado e salvo');
        }
        
        if (parsed.type) {
          notificationType = parsed.type;
          console.log('📋 SW v28: Tipo de notificação:', notificationType);
        }
      } else {
        message = extractCleanMessage(rawText);
      }
      
      if (message.includes('{') || message.includes('}')) {
        console.log('⚠️ SW v28: Mensagem ainda tem JSON, limpando...');
        message = extractCleanMessage(message);
      }
      
      console.log('✅ SW v28: Dados finais:', {
        title: title,
        message: message.substring(0, 100),
        hasAudio: hasAudio,
        hasImage: iconUrl !== '/pwa-192x192.png'
      });
    }
  } catch (err) {
    console.error('❌ SW v28: Erro ao processar:', err);
    message = 'Nova notificação do 7care';
  }
  
  const notificationOptions = {
    body: message,
    icon: iconUrl,
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: '7care-notification',
    requireInteraction: hasAudio,
    silent: false,
    renotify: true,
    data: {
      audio: audioData,
      hasAudio: hasAudio
    }
  };
  
  if (hasAudio) {
    notificationOptions.actions = [
      {
        action: 'play-audio',
        title: '🎵 Tocar Áudio',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/pwa-192x192.png'
      }
    ];
  }
  
  console.log('📬 SW v28: Salvando notificação no histórico e exibindo');

  event.waitUntil(
    (async () => {
      const notificationData = {
        id: Date.now().toString(),
        title: title,
        message: message,
        type: notificationType || 'general',
        hasAudio: hasAudio,
        hasImage: hasImage,
        audioData: audioData,
        imageData: imageData,
        timestamp: new Date().toISOString(),
        read: false
      };

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      console.log('👥 SW v28: Clientes encontrados:', clients.length);
      
      clients.forEach(client => {
        client.postMessage({
          type: 'SAVE_NOTIFICATION',
          notification: notificationData
        });
        console.log('✅ SW v28: Mensagem enviada para cliente');
      });

      await self.registration.showNotification(title, notificationOptions);
    })()
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW v28: Notificação clicada:', event.action);
  
  event.notification.close();
  
  try {
    const notificationData = event.notification.data || {};
    const hasAudio = notificationData.hasAudio && notificationData.audio;
    const hasImage = notificationData.hasImage && notificationData.image;
    
    if (event.action === 'close') {
      return;
    }
    
    if (hasAudio || hasImage) {
      console.log('📱 SW v28: Abrindo página de notificações (tem mídia)');
      
      event.waitUntil(
        (async () => {
          try {
            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            let client = clientList.find(c => c.url.includes(self.location.origin));
            
            if (!client) {
              console.log('📱 SW v28: Abrindo nova janela em /notifications');
              await clients.openWindow('/notifications');
            } else {
              console.log('📱 SW v28: Focando janela existente e navegando para /notifications');
              await client.focus();
              client.postMessage({
                type: 'NAVIGATE',
                url: '/notifications'
              });
            }
          } catch (err) {
            console.error('❌ SW v28: Erro ao abrir página de notificações:', err);
          }
        })()
      );
      
      return;
    }
    
    const targetUrl = notificationData.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
        .catch(err => console.error('❌ SW v28: Erro ao abrir janela:', err))
    );
  } catch (error) {
    console.error('❌ SW v28: Erro no clique:', error);
  }
});

// Background sync - Sincronizar fila offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    console.log('🔄 SW v28: Background Sync iniciado');
    event.waitUntil(syncQueueItems());
  }
});

async function syncQueueItems() {
  try {
    const db = await openSyncDB();
    const items = await getPendingFromQueue(db);
    
    console.log(`🔄 SW v28: Sincronizando ${items.length} itens pendentes...`);
    
    let success = 0;
    let failed = 0;
    
    for (const item of items) {
      try {
        console.log(`📤 SW v28: Sincronizando ${item.method} ${item.url}`);
        
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body)
        });
        
        if (response.ok) {
          await removeFromQueue(db, item.id);
          console.log(`✅ SW v28: Item ${item.id} sincronizado com sucesso`);
          success++;
        } else {
          console.error(`❌ SW v28: Falha ao sincronizar item ${item.id}: HTTP ${response.status}`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ SW v28: Erro ao sincronizar item ${item.id}:`, error);
        failed++;
      }
    }
    
    console.log(`🎉 SW v28: Sincronização completa! ${success} sucesso, ${failed} falhas`);
    
    // Limpar dados locais após sincronização bem-sucedida
    if (success > 0) {
      try {
        await clearLocalDataStore(db);
        console.log('🧹 SW v28: Dados locais sincronizados removidos');
      } catch (error) {
        console.error('❌ SW v28: Erro ao limpar dados locais:', error);
      }
    }
    
    // Notificar clients sobre sincronização completa
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        result: { success, failed }
      });
    });
    
    return { success, failed };
  } catch (error) {
    console.error('❌ SW v28: Erro na sincronização:', error);
  }
}

function getPendingFromQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_STORE_NAME], 'readonly');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const index = store.index('status');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function removeFromQueue(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function saveLocalData(db, endpoint, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LOCAL_DATA_STORE], 'readwrite');
    const store = transaction.objectStore(LOCAL_DATA_STORE);
    
    const item = {
      id: data.id || data._tempId,
      endpoint: endpoint,
      data: data,
      timestamp: Date.now()
    };
    
    const request = store.put(item);
    request.onsuccess = () => resolve(item.id);
    request.onerror = () => reject(request.error);
  });
}

function getLocalDataByEndpoint(db, endpoint) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LOCAL_DATA_STORE], 'readonly');
    const store = transaction.objectStore(LOCAL_DATA_STORE);
    const index = store.index('endpoint');
    const request = index.getAll(endpoint);
    
    request.onsuccess = () => {
      const items = (request.result || []).map(item => item.data);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

function clearLocalDataStore(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([LOCAL_DATA_STORE], 'readwrite');
    const store = transaction.objectStore(LOCAL_DATA_STORE);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Message event listener
self.addEventListener('message', (event) => {
  try {
    const respond = (data) => {
      if (event.ports && event.ports[0]) {
        try {
          event.ports[0].postMessage(data);
        } catch (err) {
          console.warn('⚠️ SW v28: Could not post message to port:', err);
        }
      }
    };

    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
      respond({ success: true });
    } else if (event.data && event.data.type === 'SYNC_NOW') {
      // Sincronizar fila manualmente
      syncQueueItems().then(result => {
        respond({ success: true, result });
      }).catch(error => {
        respond({ success: false, error: error.message });
      });
    } else if (event.data && event.data.type === 'CACHE_URLS') {
      // Mensagem para cachear URLs específicas
      const urls = event.data.urls || [];
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          urls.map(url => fetch(url).then(response => cache.put(url, response)))
        );
      }).then(() => {
        respond({ success: true, cached: urls.length });
      });
    } else {
      respond({ success: true, message: 'Message received' });
    }
  } catch (error) {
    console.error('❌ SW v28: Error in message listener:', error);
    if (event.ports && event.ports[0]) {
      try {
        event.ports[0].postMessage({ success: false, error: error.message });
      } catch (err) {
        console.warn('⚠️ SW v28: Could not post error message to port:', err);
      }
    }
  }
});

console.log('✅ SW v28: Service Worker carregado');
console.log('🎉 SW v28: Features ativas:');
console.log('   - Auto-Cache Completo (97+ arquivos)');
console.log('   - Cache de API com fallback');
console.log('   - Offline Sync Queue (POST/PUT/PATCH)');
console.log('   - Background Sync automático');
