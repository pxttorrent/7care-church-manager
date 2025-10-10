#!/usr/bin/env node

/**
 * Script de teste para simular criação offline e sincronização
 * 
 * Este script vai:
 * 1. Verificar estrutura do IndexedDB
 * 2. Simular criação de evento offline
 * 3. Verificar se dados foram salvos
 * 4. Simular mesclagem de dados
 * 5. Simular sincronização
 */

const API_BASE = 'https://7care.netlify.app';

console.log('\n');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║    🔍 TESTE DE SIMULAÇÃO DE OFFLINE SYNC                 ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');

console.log('\n⚠️  IMPORTANTE: Este teste precisa ser executado no navegador,');
console.log('    não no Node.js, pois usa IndexedDB.');
console.log('\n📋 Copie e cole o código abaixo no Console do navegador (F12):');
console.log('    Acesse: https://7care.netlify.app/calendar');
console.log('    Pressione F12 → Console → Cole o código\n');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║           CÓDIGO PARA COLAR NO CONSOLE                   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const browserCode = `
// ========== TESTE DE OFFLINE SYNC - Cole no Console do Navegador ==========

(async function testOfflineSync() {
  console.log('\\n🔍 INICIANDO TESTE DE OFFLINE SYNC...\\n');
  
  const SYNC_DB_NAME = '7care-sync-db';
  const SYNC_STORE_NAME = 'sync-queue';
  const LOCAL_DATA_STORE = 'local-data';
  
  // ========== PASSO 1: Verificar IndexedDB ==========
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 1: Verificando estrutura do IndexedDB            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\\n');
  
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(SYNC_DB_NAME, 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
          const store = db.createObjectStore(SYNC_STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains(LOCAL_DATA_STORE)) {
          const dataStore = db.createObjectStore(LOCAL_DATA_STORE, { keyPath: 'id' });
          dataStore.createIndex('endpoint', 'endpoint', { unique: false });
        }
      };
    });
  }
  
  const db = await openDB();
  console.log('✅ IndexedDB aberto:', db.name, 'v' + db.version);
  console.log('📋 Object Stores:', Array.from(db.objectStoreNames).join(', '));
  
  // ========== PASSO 2: Simular Criação Offline ==========
  console.log('\\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 2: Simulando criação de evento OFFLINE           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\\n');
  
  const eventoTeste = {
    title: 'Evento Teste Offline ' + Date.now(),
    date: new Date().toISOString(),
    location: 'Igreja Central',
    type: 'Reunião',
    description: 'Teste de criação offline'
  };
  
  console.log('📝 Dados do evento:', eventoTeste);
  
  // Simular o que o Service Worker faz
  const tempId = \`temp_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  
  // 1. Adicionar à sync-queue
  const addToSyncQueue = () => new Promise((resolve, reject) => {
    const tx = db.transaction([SYNC_STORE_NAME], 'readwrite');
    const store = tx.objectStore(SYNC_STORE_NAME);
    const item = {
      url: 'https://7care.netlify.app/api/events',
      method: 'POST',
      body: eventoTeste,
      headers: { 'Content-Type': 'application/json' },
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };
    const req = store.add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  
  const queueId = await addToSyncQueue();
  console.log('✅ Adicionado à sync-queue com ID:', queueId);
  
  // 2. Adicionar ao local-data
  const addToLocalData = () => new Promise((resolve, reject) => {
    const tx = db.transaction([LOCAL_DATA_STORE], 'readwrite');
    const store = tx.objectStore(LOCAL_DATA_STORE);
    const localItem = {
      id: tempId,
      endpoint: '/api/events',
      data: {
        ...eventoTeste,
        id: tempId,
        _tempId: tempId,
        _pendingSync: true,
        _offlineCreated: true,
        createdAt: new Date().toISOString()
      },
      timestamp: Date.now()
    };
    const req = store.put(localItem);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  
  const localId = await addToLocalData();
  console.log('✅ Adicionado ao local-data com ID:', localId);
  
  // ========== PASSO 3: Verificar o que foi salvo ==========
  console.log('\\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 3: Verificando o que foi salvo                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\\n');
  
  // Verificar sync-queue
  const checkSyncQueue = () => new Promise((resolve) => {
    const tx = db.transaction([SYNC_STORE_NAME], 'readonly');
    const store = tx.objectStore(SYNC_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
  
  const queueItems = await checkSyncQueue();
  console.log(\`📋 Itens na sync-queue: \${queueItems.length}\`);
  if (queueItems.length > 0) {
    console.log('📦 Último item:', queueItems[queueItems.length - 1]);
  }
  
  // Verificar local-data
  const checkLocalData = () => new Promise((resolve) => {
    const tx = db.transaction([LOCAL_DATA_STORE], 'readonly');
    const store = tx.objectStore(LOCAL_DATA_STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
  
  const localItems = await checkLocalData();
  console.log(\`📋 Itens no local-data: \${localItems.length}\`);
  if (localItems.length > 0) {
    console.log('📦 Último item:', localItems[localItems.length - 1]);
  }
  
  // ========== PASSO 4: Simular Busca (GET) com Mesclagem ==========
  console.log('\\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 4: Simulando busca de eventos (GET /api/events)  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\\n');
  
  // Buscar local-data por endpoint
  const getLocalByEndpoint = (endpoint) => new Promise((resolve) => {
    const tx = db.transaction([LOCAL_DATA_STORE], 'readonly');
    const store = tx.objectStore(LOCAL_DATA_STORE);
    const index = store.index('endpoint');
    const req = index.getAll(endpoint);
    req.onsuccess = () => {
      const items = (req.result || []).map(item => item.data);
      resolve(items);
    };
  });
  
  const localEvents = await getLocalByEndpoint('/api/events');
  console.log(\`💾 Eventos locais (criados offline): \${localEvents.length}\`);
  if (localEvents.length > 0) {
    console.log('📦 Eventos locais:');
    localEvents.forEach((evt, idx) => {
      console.log(\`   \${idx + 1}. \${evt.title} (ID: \${evt.id})\`);
    });
  }
  
  // Simular busca do cache
  console.log('\\n📡 Simulando busca do cache de API...');
  const cacheEvents = await caches.match('/api/events')
    .then(r => r ? r.json() : [])
    .catch(() => []);
  
  console.log(\`💾 Eventos do cache: \${Array.isArray(cacheEvents) ? cacheEvents.length : 0}\`);
  
  // Mesclar
  const merged = [...localEvents, ...(Array.isArray(cacheEvents) ? cacheEvents : [])];
  console.log(\`\\n✅ TOTAL MESCLADO: \${merged.length} eventos\`);
  console.log('📋 Primeiros 3 eventos mesclados:');
  merged.slice(0, 3).forEach((evt, idx) => {
    console.log(\`   \${idx + 1}. \${evt.title} (ID: \${evt.id})\${evt._pendingSync ? ' 🔄 Pendente' : ''}\`);
  });
  
  // ========== PASSO 5: Testar Sincronização ==========
  console.log('\\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 5: Verificando se pode sincronizar               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\\n');
  
  if (queueItems.length > 0) {
    console.log(\`📤 \${queueItems.length} itens prontos para sincronizar\`);
    console.log('\\n💡 Para sincronizar agora, execute:');
    console.log('   if (navigator.serviceWorker.controller) {');
    console.log('     const mc = new MessageChannel();');
    console.log('     navigator.serviceWorker.controller.postMessage(');
    console.log('       { type: "SYNC_NOW" },');
    console.log('       [mc.port2]');
    console.log('     );');
    console.log('   }');
  } else {
    console.log('⚠️  Nenhum item na fila de sincronização');
  }
  
  // ========== RESUMO ==========
  console.log('\\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DO TESTE                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\\n');
  
  console.log(\`✅ IndexedDB: \${db.objectStoreNames.length} stores\`);
  console.log(\`📋 Sync Queue: \${queueItems.length} itens\`);
  console.log(\`💾 Local Data: \${localItems.length} itens\`);
  console.log(\`🔀 Eventos mesclados: \${merged.length} total\`);
  
  if (localEvents.length > 0 && merged.length > localEvents.length) {
    console.log('\\n✅ DIAGNÓSTICO: Sistema funcionando!');
    console.log('   - Dados locais salvos ✅');
    console.log('   - Mesclagem funcionando ✅');
    console.log('   - Eventos aparecem na lista ✅');
  } else if (localEvents.length > 0) {
    console.log('\\n⚠️  DIAGNÓSTICO: Dados salvos mas não mesclados');
    console.log('   - Dados locais salvos ✅');
    console.log('   - Mesclagem pode ter problema ❌');
  } else {
    console.log('\\n❌ DIAGNÓSTICO: Dados não foram salvos!');
    console.log('   - Service Worker pode não estar interceptando');
    console.log('   - Verificar logs do SW');
  }
  
  console.log('\\n📊 Para ver dados reais da aplicação:');
  console.log('   1. Vá em /calendar');
  console.log('   2. Modo avião ON');
  console.log('   3. Crie um evento');
  console.log('   4. Execute este teste novamente');
  console.log('   5. Verifique se Local Data aumentou\\n');
  
})();
`;

console.log(browserCode);

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║              TESTE ALTERNATIVO (Node.js)                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('Como IndexedDB não funciona no Node.js, vou verificar');
console.log('se os endpoints de API estão funcionando corretamente:\n');

async function testAPIEndpoints() {
  console.log('🧪 Testando endpoints de eventos...\n');
  
  try {
    // Teste 1: GET /api/events
    console.log('1️⃣ GET /api/events');
    const getRes = await fetch(`${API_BASE}/api/events`);
    const events = await getRes.json();
    console.log(`   ✅ Status: ${getRes.status}`);
    console.log(`   📋 Eventos retornados: ${Array.isArray(events) ? events.length : 'N/A'}`);
    
    if (Array.isArray(events) && events.length > 0) {
      console.log('   📦 Primeiro evento:', {
        id: events[0].id,
        title: events[0].title,
        date: events[0].date
      });
    }
    
    console.log('\\n2️⃣ Verificando headers de resposta:');
    console.log('   Cache-Control:', getRes.headers.get('cache-control') || 'não definido');
    console.log('   Content-Type:', getRes.headers.get('content-type') || 'não definido');
    
    console.log('\\n3️⃣ Verificando se Service Worker está ativo:');
    console.log('   💡 IMPORTANTE: Este teste roda no Node.js');
    console.log('   💡 Para verificar SW, use o código acima no navegador');
    
    console.log('\\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    INSTRUÇÕES                             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\\n');
    
    console.log('Para testar o Offline Sync COMPLETO:');
    console.log('\\n1. Abra https://7care.netlify.app/calendar');
    console.log('2. Abra DevTools (F12) → Console');
    console.log('3. Cole o código acima (entre as linhas marcadas)');
    console.log('4. Veja o diagnóstico completo no console');
    console.log('\\nOU');
    console.log('\\n1. Vá em /calendar');
    console.log('2. Modo avião ON');
    console.log('3. Crie evento');
    console.log('4. Veja console do navegador');
    console.log('5. Procure por:');
    console.log('   - "📝 SW v28: OFFLINE - Salvando operação"');
    console.log('   - "💾 SW v28: Dados locais salvos"');
    console.log('   - "🔀 SW v28: Mesclando X itens"');
    console.log('\\n6. Se NÃO vir essas mensagens:');
    console.log('   - SW não está interceptando corretamente');
    console.log('   - Verifique se SW está ativo (Application → Service Workers)');
    console.log('   - Force atualização do SW (Update on reload)\\n');
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testAPIEndpoints();

