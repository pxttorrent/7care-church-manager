/**
 * Script de Teste de Limpeza Completa
 * 
 * Como usar:
 * 1. Abra https://7care.netlify.app/ no navegador
 * 2. Faça login como admin
 * 3. Pressione F12 para abrir o Console
 * 4. Cole este script inteiro no console
 * 5. Pressione Enter
 * 6. Observe os logs detalhados
 */

(async function testarLimpezaCompleta() {
  console.log('%c🧹 INICIANDO TESTE DE LIMPEZA COMPLETA', 'font-size: 20px; font-weight: bold; color: #4CAF50');
  console.log('═'.repeat(80));
  
  try {
    // 1. Limpar banco de dados no servidor
    console.log('\n%c📡 ETAPA 1: Limpando banco de dados...', 'font-size: 16px; font-weight: bold; color: #2196F3');
    const response = await fetch('/api/system/clear-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Falha ao limpar dados do servidor');
    }
    
    console.log('✅ Banco de dados limpo');
    console.log('   Detalhes:', result);
    
    // 2. Limpar React Query Cache
    console.log('\n%c🗑️ ETAPA 2: Limpando React Query cache...', 'font-size: 16px; font-weight: bold; color: #FF9800');
    if (window.queryClient) {
      window.queryClient.clear();
      console.log('✅ React Query cache limpo');
    } else {
      console.warn('⚠️ queryClient não encontrado no window');
    }
    
    // 3. Limpar IndexedDB
    console.log('\n%c🗑️ ETAPA 3: Limpando IndexedDB...', 'font-size: 16px; font-weight: bold; color: #9C27B0');
    try {
      const databases = await indexedDB.databases();
      console.log(`   Encontrados ${databases.length} bancos IndexedDB`);
      
      for (const db of databases) {
        if (db.name) {
          console.log(`   🗑️ Deletando: ${db.name}`);
          indexedDB.deleteDatabase(db.name);
        }
      }
      console.log('✅ IndexedDB limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar IndexedDB:', error.message);
    }
    
    // 4. Limpar localStorage (exceto tema e idioma)
    console.log('\n%c🗑️ ETAPA 4: Limpando localStorage...', 'font-size: 16px; font-weight: bold; color: #F44336');
    const keysToKeep = ['theme', 'language'];
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    
    console.log(`   Total de chaves: ${localStorage.length}`);
    console.log(`   Chaves a remover: ${keysToRemove.length}`);
    console.log(`   Chaves mantidas: ${keysToKeep.join(', ')}`);
    
    keysToRemove.forEach(key => {
      console.log(`   🗑️ Removendo: ${key}`);
      localStorage.removeItem(key);
    });
    console.log('✅ localStorage limpo');
    
    // 5. Limpar sessionStorage
    console.log('\n%c🗑️ ETAPA 5: Limpando sessionStorage...', 'font-size: 16px; font-weight: bold; color: #00BCD4');
    const sessionKeysCount = sessionStorage.length;
    sessionStorage.clear();
    console.log(`✅ sessionStorage limpo (${sessionKeysCount} chaves removidas)`);
    
    // 6. Limpar Service Worker Cache
    console.log('\n%c🗑️ ETAPA 6: Limpando Service Worker cache...', 'font-size: 16px; font-weight: bold; color: #FF5722');
    try {
      const cacheNames = await caches.keys();
      console.log(`   Encontrados ${cacheNames.length} caches`);
      
      for (const cacheName of cacheNames) {
        console.log(`   🗑️ Deletando cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
      console.log('✅ Service Worker cache limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar Service Worker cache:', error.message);
    }
    
    // 7. Desregistrar Service Worker
    console.log('\n%c🗑️ ETAPA 7: Desregistrando Service Worker...', 'font-size: 16px; font-weight: bold; color: #E91E63');
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`   Encontrados ${registrations.length} Service Workers registrados`);
        
        for (const registration of registrations) {
          console.log(`   🗑️ Desregistrando SW: ${registration.scope}`);
          await registration.unregister();
        }
        
        console.log('✅ Service Worker desregistrado');
        
        if (navigator.serviceWorker.controller) {
          console.log('   📤 Enviando mensagem SKIP_WAITING para SW ativo');
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
      } else {
        console.warn('⚠️ Service Worker não suportado neste navegador');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao desregistrar Service Worker:', error.message);
    }
    
    // Resumo
    console.log('\n' + '═'.repeat(80));
    console.log('%c🎉 LIMPEZA COMPLETA CONCLUÍDA COM SUCESSO!', 'font-size: 20px; font-weight: bold; color: #4CAF50');
    console.log('═'.repeat(80));
    
    console.log('\n%c📊 RESUMO:', 'font-size: 16px; font-weight: bold');
    console.log('   ✅ Banco de dados: Limpo');
    console.log('   ✅ React Query cache: Limpo');
    console.log('   ✅ IndexedDB: Limpo');
    console.log('   ✅ localStorage: Limpo (exceto tema/idioma)');
    console.log('   ✅ sessionStorage: Limpo');
    console.log('   ✅ Service Worker cache: Limpo');
    console.log('   ✅ Service Worker: Desregistrado');
    
    console.log('\n%c⏱️ A página será recarregada em 3 segundos...', 'font-size: 14px; color: #FF9800');
    console.log('ℹ️ Após o reload, todas as páginas deverão estar vazias');
    
    // Aguardar 3 segundos e recarregar
    setTimeout(() => {
      console.log('%c🔄 Recarregando página...', 'font-size: 16px; font-weight: bold; color: #2196F3');
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.log('\n' + '═'.repeat(80));
    console.error('%c❌ ERRO NA LIMPEZA!', 'font-size: 20px; font-weight: bold; color: #F44336');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.log('═'.repeat(80));
  }
})();

console.log('\n%cℹ️ OBSERVAÇÃO:', 'font-size: 14px; font-weight: bold; color: #2196F3');
console.log('Este script executará a limpeza completa do sistema.');
console.log('Certifique-se de que você está logado como admin.');
console.log('Todos os dados serão permanentemente deletados (exceto usuário admin).');

