// ==========================================
// SCRIPT DE LIMPEZA COMPLETA - VERSÃO SIMPLES
// ==========================================
// COMO USAR:
// 1. Abra https://7care.netlify.app/
// 2. Faça login como admin
// 3. Pressione F12 (abre Console)
// 4. Cole ESTE código inteiro
// 5. Pressione Enter
// ==========================================

console.clear();
console.log('%c🧹 LIMPEZA COMPLETA DO SISTEMA', 'font-size: 24px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
console.log('══════════════════════════════════════════════════════════════════════');

(async () => {
  try {
    // 1. Banco de Dados
    console.log('\n%c📡 [1/7] Limpando banco de dados...', 'font-size: 16px; color: #2196F3; font-weight: bold;');
    const response = await fetch('/api/system/clear-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    console.log(response.ok ? '✅ Banco limpo' : '❌ Erro no banco:', result);
    
    // 2. React Query
    console.log('\n%c🗑️ [2/7] Limpando React Query...', 'font-size: 16px; color: #FF9800; font-weight: bold;');
    if (window.queryClient) {
      window.queryClient.clear();
      console.log('✅ React Query limpo');
    } else {
      console.log('⚠️ React Query não encontrado');
    }
    
    // 3. IndexedDB
    console.log('\n%c🗑️ [3/7] Limpando IndexedDB...', 'font-size: 16px; color: #9C27B0; font-weight: bold;');
    const dbs = await indexedDB.databases();
    console.log(`   Encontrados ${dbs.length} bancos`);
    dbs.forEach(db => {
      if (db.name) {
        console.log(`   🗑️ ${db.name}`);
        indexedDB.deleteDatabase(db.name);
      }
    });
    console.log('✅ IndexedDB limpo');
    
    // 4. localStorage
    console.log('\n%c🗑️ [4/7] Limpando localStorage...', 'font-size: 16px; color: #F44336; font-weight: bold;');
    const keep = ['theme', 'language'];
    const remove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keep.includes(key)) remove.push(key);
    }
    console.log(`   Removendo ${remove.length} chaves`);
    remove.forEach(key => {
      console.log(`   🗑️ ${key}`);
      localStorage.removeItem(key);
    });
    console.log('✅ localStorage limpo');
    
    // 5. sessionStorage
    console.log('\n%c🗑️ [5/7] Limpando sessionStorage...', 'font-size: 16px; color: #00BCD4; font-weight: bold;');
    const sessionCount = sessionStorage.length;
    sessionStorage.clear();
    console.log(`✅ sessionStorage limpo (${sessionCount} chaves)`);
    
    // 6. Cache
    console.log('\n%c🗑️ [6/7] Limpando Cache...', 'font-size: 16px; color: #FF5722; font-weight: bold;');
    const cacheNames = await caches.keys();
    console.log(`   Encontrados ${cacheNames.length} caches`);
    for (const name of cacheNames) {
      console.log(`   🗑️ ${name}`);
      await caches.delete(name);
    }
    console.log('✅ Cache limpo');
    
    // 7. Service Worker
    console.log('\n%c🗑️ [7/7] Desregistrando Service Worker...', 'font-size: 16px; color: #E91E63; font-weight: bold;');
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      console.log(`   Encontrados ${regs.length} Service Workers`);
      for (const reg of regs) {
        console.log(`   🗑️ ${reg.scope}`);
        await reg.unregister();
      }
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      console.log('✅ Service Worker desregistrado');
    } else {
      console.log('⚠️ Service Worker não suportado');
    }
    
    // Conclusão
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('%c🎉 LIMPEZA CONCLUÍDA COM SUCESSO!', 'font-size: 24px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
    console.log('══════════════════════════════════════════════════════════════════════');
    console.log('\n%c📊 RESUMO:', 'font-size: 18px; font-weight: bold; color: #2196F3;');
    console.log('✅ Banco de dados: Limpo');
    console.log('✅ React Query: Limpo');
    console.log('✅ IndexedDB: Limpo');
    console.log('✅ localStorage: Limpo');
    console.log('✅ sessionStorage: Limpo');
    console.log('✅ Cache: Limpo');
    console.log('✅ Service Worker: Desregistrado');
    console.log('\n%c⏱️ Recarregando em 3 segundos...', 'font-size: 16px; color: #FF9800;');
    
    setTimeout(() => {
      console.log('%c🔄 RECARREGANDO...', 'font-size: 18px; font-weight: bold; color: #2196F3;');
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.error('%c❌ ERRO!', 'font-size: 24px; font-weight: bold; color: #F44336; background: #000; padding: 10px;');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.log('══════════════════════════════════════════════════════════════════════');
  }
})();

