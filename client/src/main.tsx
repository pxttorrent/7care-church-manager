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
// Service Worker + Notifications Manager
if ('serviceWorker' in navigator) {
  // LISTENER GLOBAL - Registrar ANTES do load para capturar mensagens durante abertura do PWA
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 [GLOBAL] Mensagem do SW recebida:', event.data);
    
    // Salvar notificação no histórico
    if (event.data.type === 'SAVE_NOTIFICATION' && event.data.notification) {
      console.log('💾 [MAIN] Salvando notificação no histórico...');
      console.log('📦 [MAIN] Notificação recebida:', {
        hasAudio: event.data.notification.hasAudio,
        hasImage: event.data.notification.hasImage,
        audioDataLength: event.data.notification.audioData?.length || 0,
        imageDataLength: event.data.notification.imageData?.length || 0,
        title: event.data.notification.title
      });
      
      try {
        // Obter user_id do localStorage
        const authData = localStorage.getItem('7care_auth');
        if (authData) {
          const { user } = JSON.parse(authData);
          const userId = user?.id;
          
          if (userId) {
            const key = `notifications_${userId}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = [event.data.notification, ...existing].slice(0, 50); // Limitar a 50
            localStorage.setItem(key, JSON.stringify(updated));
            console.log('✅ [MAIN] Notificação salva no histórico! Total:', updated.length);
            console.log('💾 [MAIN] Salvo em:', key);
            
            // Disparar evento customizado para atualizar UI
            window.dispatchEvent(new CustomEvent('newNotification', { detail: event.data.notification }));
          } else {
            console.warn('⚠️ [MAIN] userId não encontrado');
          }
        } else {
          console.warn('⚠️ [MAIN] authData não encontrado');
        }
      } catch (error) {
        console.error('❌ [MAIN] Erro ao salvar notificação:', error);
      }
    }
    
    // Navegar para URL especificada
    if (event.data.type === 'NAVIGATE' && event.data.url) {
      console.log('🧭 Navegando para:', event.data.url);
      window.location.href = event.data.url;
    }
    
    // REMOVIDO: Sistema de áudio direto removido - agora usar página /notifications
  });
  
  // Registrar Service Worker
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
