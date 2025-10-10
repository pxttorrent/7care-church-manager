import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler for Chrome extension messages and service worker errors
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || '';
  
  // Suppress Chrome extension and service worker message channel errors
  if (errorMessage.includes('message channel closed before a response was received') ||
      errorMessage.includes('listener indicated an asynchronous response') ||
      errorMessage.includes('SKIP_WAITING') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('asynchronous response')) {
    event.preventDefault();
    // Silently suppress
    return;
  }
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  
  // Suppress service worker related errors
  if (errorMessage.includes('message channel closed') ||
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('listener indicated')) {
    event.preventDefault();
    // Silently suppress
    return;
  }
});

// Handle Chrome extension runtime errors
if (typeof chrome !== 'undefined' && chrome.runtime) {
  try {
    chrome.runtime.onMessage?.addListener((message, sender, sendResponse) => {
      // Handle messages properly to avoid channel closure errors
      try {
        sendResponse({ success: true });
      } catch (e) {
        // Ignore channel closure errors
      }
      return false; // Don't keep channel open
    });
  } catch (error) {
    // Silently ignore extension API errors
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
  
  // Registrar Service Worker COM ATUALIZAÇÃO FORÇADA
  window.addEventListener('load', async () => {
    console.log('🚀 Iniciando Service Worker v28...');
    
    try {
      // Registrar ou atualizar Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Força buscar sw.js do servidor sempre
      });
      
      console.log('✅ Service Worker registrado!');
      
      // Verificar se há atualização esperando
      if (registration.waiting) {
        console.log('🔄 Nova versão do SW encontrada, ativando...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Recarregar página quando novo SW assumir controle
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker atualizado, recarregando...');
          window.location.reload();
        });
      }
      
      // Verificar atualizações automaticamente
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🆕 Atualização do Service Worker encontrada...');
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ Nova versão instalada, ativando...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
      
      // Forçar verificação de atualizações
      await registration.update();
      console.log('✅ Verificação de atualizações concluída');
      
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
