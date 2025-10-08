// Script para forçar atualização imediata do Service Worker
(function() {
  'use strict';
  
  console.log('🔄 Forçando atualização do Service Worker...');
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('📦 Registrations encontradas:', registrations.length);
      
      for (let registration of registrations) {
        console.log('🗑️ Removendo registration antiga...');
        registration.unregister().then(function(boolean) {
          console.log('✅ Registration removida:', boolean);
        });
      }
      
      // Aguardar um pouco e registrar nova versão
      setTimeout(function() {
        console.log('🆕 Registrando nova versão do Service Worker...');
        navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        }).then(function(registration) {
          console.log('✅ Service Worker registrado com sucesso!');
          console.log('🔧 Scope:', registration.scope);
          console.log('📦 State:', registration.active ? registration.active.state : 'installing');
          
          // Forçar ativação imediata
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            console.log('⚡ Pulando waiting e ativando imediatamente');
          }
          
          // Recarregar página após 2 segundos
          setTimeout(function() {
            console.log('🔄 Recarregando página...');
            window.location.reload();
          }, 2000);
          
        }).catch(function(error) {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });
      }, 1000);
    });
  } else {
    console.warn('⚠️ Service Worker não suportado neste navegador');
  }
})();
