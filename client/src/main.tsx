import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for Chrome extension messages and service worker errors
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || '';
  
  // Suppress Chrome extension and service worker message channel errors
  if (errorMessage.includes('message channel closed before a response was received') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('SKIP_WAITING')) {
    event.preventDefault();
    console.warn('Service worker/extension message channel error suppressed:', event.reason);
  }
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  
  // Suppress service worker related errors
  if (errorMessage.includes('message channel closed') ||
      errorMessage.includes('asynchronous response')) {
    event.preventDefault();
    console.warn('Service worker error suppressed:', event.error);
  }
});

// Handle Chrome extension runtime errors
if (typeof chrome !== 'undefined' && chrome.runtime) {
  try {
    chrome.runtime.onMessage?.addListener((message, sender, sendResponse) => {
      // Handle messages properly to avoid channel closure errors
      if (sendResponse) {
        sendResponse({ success: true });
      }
      return true; // Indicate we will send a response asynchronously
    });
  } catch (error) {
    console.warn('Chrome extension API not available:', error);
  }
}

// AUTOMATIC SERVICE WORKER UPDATE - EXECUTA SEMPRE QUE A PÁGINA CARREGA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('🚀 AUTO-UPDATE: Verificando Service Worker...');
    
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🔍 AUTO-UPDATE: Encontradas', registrations.length, 'registrations');
      
      // SEMPRE forçar atualização para garantir SW v11
      if (registrations.length > 0) {
        console.log('🔄 AUTO-UPDATE: Forçando atualização...');
        
        // Remover todas as registrations
        const promises = registrations.map(registration => {
          console.log('❌ AUTO-UPDATE: Removendo:', registration.scope);
          return registration.unregister();
        });
        
        Promise.all(promises).then(function() {
          console.log('✅ AUTO-UPDATE: Registrations removidas');
          
          // Limpar cache
          if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
              console.log('🗑️ AUTO-UPDATE: Limpando', cacheNames.length, 'caches');
              const deletePromises = cacheNames.map(cacheName => {
                console.log('❌ AUTO-UPDATE: Deletando cache:', cacheName);
                return caches.delete(cacheName);
              });
              
              Promise.all(deletePromises).then(function() {
                console.log('✅ AUTO-UPDATE: Caches limpos');
                
                // Aguardar e registrar nova versão
                setTimeout(function() {
                  console.log('🆕 AUTO-UPDATE: Registrando SW v11...');
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                  }).then(function(registration) {
                    console.log('✅ AUTO-UPDATE: SW v11 registrado!');
                    
                    // Forçar ativação
                    if (registration.waiting) {
                      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    
                    // Recarregar após 2 segundos
                    setTimeout(function() {
                      console.log('🔄 AUTO-UPDATE: Recarregando...');
                      window.location.reload();
                    }, 2000);
                    
                  }).catch(function(error) {
                    console.error('❌ AUTO-UPDATE: Erro:', error);
                  });
                }, 1000);
              });
            });
          }
        });
      } else {
        console.log('✅ AUTO-UPDATE: Nenhuma registration encontrada, registrando SW v11...');
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('✅ AUTO-UPDATE: SW v11 registrado!');
        });
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
