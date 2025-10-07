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

// Register service worker for PWA and push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
