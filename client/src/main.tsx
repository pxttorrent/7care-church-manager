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
      
      // Verificar se precisa atualizar (sem loop)
      if (registrations.length > 0) {
        console.log('✅ SW: Já registrado, verificando atualizações...');
        
        // Verificar se há atualização disponível
        const registration = registrations[0];
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 SW: Nova versão disponível');
                // Não recarregar automaticamente para evitar loop
              }
            });
          }
        });
      } else {
        console.log('🆕 SW: Registrando pela primeira vez...');
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('✅ SW: Registrado com sucesso!');
        }).catch(function(error) {
          console.error('❌ SW: Erro ao registrar:', error);
        });
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
