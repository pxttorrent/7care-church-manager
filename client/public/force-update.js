// Script ULTRA AGRESSIVO para forçar atualização do Service Worker
(function() {
  'use strict';
  
  console.log('🚀 FORÇANDO ATUALIZAÇÃO ULTRA AGRESSIVA DO SERVICE WORKER...');
  
  if ('serviceWorker' in navigator) {
    // 1. Remover TODAS as registrations
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🗑️ Removendo', registrations.length, 'registrations antigas...');
      
      const promises = registrations.map(registration => {
        console.log('❌ Removendo:', registration.scope);
        return registration.unregister();
      });
      
      Promise.all(promises).then(function() {
        console.log('✅ Todas as registrations removidas!');
        
        // 2. Limpar cache
        if ('caches' in window) {
          caches.keys().then(function(cacheNames) {
            console.log('🗑️ Limpando', cacheNames.length, 'caches...');
            const deletePromises = cacheNames.map(cacheName => {
              console.log('❌ Deletando cache:', cacheName);
              return caches.delete(cacheName);
            });
            
            Promise.all(deletePromises).then(function() {
              console.log('✅ Todos os caches limpos!');
              
              // 3. Aguardar e registrar nova versão
              setTimeout(function() {
                console.log('🆕 Registrando Service Worker v11...');
                navigator.serviceWorker.register('/sw.js', {
                  scope: '/'
                }).then(function(registration) {
                  console.log('✅ Service Worker v11 registrado!');
                  console.log('🔧 Scope:', registration.scope);
                  
                  // 4. Forçar ativação imediata
                  if (registration.waiting) {
                    console.log('⚡ Ativando waiting...');
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                  
                  if (registration.installing) {
                    console.log('⚡ Ativando installing...');
                    registration.installing.addEventListener('statechange', function() {
                      if (this.state === 'installed' && registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                      }
                    });
                  }
                  
                  // 5. Recarregar página após 3 segundos
                  setTimeout(function() {
                    console.log('🔄 RECARREGANDO PÁGINA...');
                    window.location.reload(true);
                  }, 3000);
                  
                }).catch(function(error) {
                  console.error('❌ Erro ao registrar SW v11:', error);
                });
              }, 2000);
            });
          });
        } else {
          // Se não tem cache, apenas registrar
          setTimeout(function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
              console.log('✅ Service Worker registrado sem cache!');
              setTimeout(() => window.location.reload(true), 3000);
            });
          }, 1000);
        }
      });
    });
  } else {
    console.warn('⚠️ Service Worker não suportado');
  }
})();
