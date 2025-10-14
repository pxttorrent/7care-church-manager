// Verificar se modo offline está ativo
import https from 'https';

console.log('🔍 VERIFICAÇÃO DO MODO OFFLINE\n');
console.log('═'.repeat(80));

console.log(`
📋 INSTRUÇÕES:

Cole este script no Console (F12) de cada página:

════════════════════════════════════════════════════════════════

// Verificar Service Worker e Cache
(async function verificarOffline() {
  console.log('═'.repeat(60));
  console.log('VERIFICAÇÃO DE MODO OFFLINE');
  console.log('═'.repeat(60));
  
  // 1. Service Worker
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('\\n📱 SERVICE WORKER:');
    console.log('  Registrado?', registrations.length > 0 ? '✅ SIM' : '❌ NÃO');
    
    if (registrations.length > 0) {
      registrations.forEach(reg => {
        console.log('  Scope:', reg.scope);
        console.log('  Estado:', reg.active ? '✅ Ativo' : '⚠️ Inativo');
      });
    } else {
      console.log('  ⚠️ Service Worker NÃO está registrado!');
      console.log('  Modo offline não funcionará sem Service Worker.');
    }
  } else {
    console.log('❌ Service Worker não suportado neste navegador');
  }
  
  // 2. Caches
  const cacheKeys = await caches.keys();
  console.log('\\n💾 CACHES:');
  console.log('  Total de caches:', cacheKeys.length);
  
  if (cacheKeys.length === 0) {
    console.log('  ⚠️ Nenhum cache encontrado!');
  } else {
    cacheKeys.forEach(key => console.log('  -', key));
    
    // Verificar conteúdo do cache principal
    const mainCache = cacheKeys.find(k => k.includes('7care'));
    if (mainCache) {
      const cache = await caches.open(mainCache);
      const requests = await cache.keys();
      console.log(\`\\n  Cache "\${mainCache}":\`, requests.length, 'itens');
      console.log('  Primeiros 10 itens:');
      requests.slice(0, 10).forEach(req => {
        console.log('    -', req.url);
      });
    }
  }
  
  // 3. IndexedDB (offlineStorage)
  const databases = await indexedDB.databases();
  console.log('\\n💽 INDEXEDDB:');
  console.log('  Databases:', databases.length);
  
  databases.forEach(db => {
    console.log('  -', db.name, '(versão', db.version + ')');
  });
  
  // Verificar se 7care-offline-storage existe
  const offlineDb = databases.find(db => db.name === '7care-offline-storage');
  if (offlineDb) {
    console.log('  ✅ Database offline encontrado');
  } else {
    console.log('  ⚠️ Database offline NÃO encontrado');
  }
  
  // 4. Status da conexão
  console.log('\\n🌐 CONEXÃO:');
  console.log('  Online?', navigator.onLine ? '✅ SIM' : '❌ NÃO');
  
  // 5. Conclusão
  console.log('\\n═'.repeat(60));
  console.log('🎯 DIAGNÓSTICO:\\n');
  
  const hasSW = registrations.length > 0;
  const hasCache = cacheKeys.length > 0;
  const hasOfflineDb = !!offlineDb;
  
  if (hasSW && hasCache && hasOfflineDb) {
    console.log('✅ MODO OFFLINE ESTÁ FUNCIONANDO!');
    console.log('  - Service Worker: ✅');
    console.log('  - Cache: ✅');
    console.log('  - IndexedDB: ✅');
  } else {
    console.log('⚠️ MODO OFFLINE COM PROBLEMAS:');
    console.log('  - Service Worker:', hasSW ? '✅' : '❌');
    console.log('  - Cache:', hasCache ? '✅' : '❌');
    console.log('  - IndexedDB:', hasOfflineDb ? '✅' : '❌');
    console.log('\\n💡 Solução: Recarregue a página ou reinstale o Service Worker');
  }
  
  console.log('═'.repeat(60));
})();

════════════════════════════════════════════════════════════════

TESTE EM CADA PÁGINA:

1. Dashboard (/dashboard)
2. Calendar (/calendar)
3. Tasks (/tasks)
4. Users (/users)
5. Prayers (/prayers)
6. Gamification (/gamification)

Se alguma página mostrar ❌, o modo offline não está ativo lá.

════════════════════════════════════════════════════════════════

SOLUÇÃO SE NÃO ESTIVER FUNCIONANDO:

// Registrar Service Worker manualmente
navigator.serviceWorker.register('/sw.js').then(reg => {
  console.log('✅ Service Worker registrado!', reg.scope);
  setTimeout(() => location.reload(), 2000);
});

════════════════════════════════════════════════════════════════
`);

console.log('💡 Execute o script acima no Console (F12) do navegador!');


