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

// Sistema offline/PWA completamente removido

createRoot(document.getElementById("root")!).render(<App />);
