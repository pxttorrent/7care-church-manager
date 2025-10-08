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
// Service Worker + Audio Player
if ('serviceWorker' in navigator) {
  // LISTENER GLOBAL - Registrar ANTES do load para capturar mensagens durante abertura do PWA
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 [GLOBAL] Mensagem do SW recebida:', event.data);
    
    if (event.data.type === 'PLAY_AUDIO' && event.data.audio) {
      console.log('🎵 [iOS] Reproduzindo áudio imediatamente...');
      
      try {
        // Criar elemento de áudio com suporte iOS
        const audio = new Audio();
          
          // Configurações para iOS
          audio.setAttribute('playsinline', '');
          audio.setAttribute('webkit-playsinline', '');
          audio.preload = 'auto';
          audio.src = event.data.audio;
          
          // Adicionar ao DOM temporariamente (necessário no iOS)
          audio.style.display = 'none';
          document.body.appendChild(audio);
          
          // Configurar Media Session API
          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: event.data.title || '7care - Áudio',
              artist: '7care',
              album: 'Notificações',
              artwork: [
                { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
              ]
            });
            
            // Configurar controles de playback
            navigator.mediaSession.setActionHandler('play', () => {
              console.log('▶️ Play clicado');
              audio.play();
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
              console.log('⏸️ Pause clicado');
              audio.pause();
            });
            
            navigator.mediaSession.setActionHandler('seekbackward', () => {
              console.log('⏪ Seek backward');
              audio.currentTime = Math.max(audio.currentTime - 10, 0);
            });
            
            navigator.mediaSession.setActionHandler('seekforward', () => {
              console.log('⏩ Seek forward');
              audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
            });
            
            navigator.mediaSession.setActionHandler('seekto', (details) => {
              if (details.seekTime) {
                console.log('🎯 Seek to:', details.seekTime);
                audio.currentTime = details.seekTime;
              }
            });
            
            // Atualizar posição do playback
            audio.addEventListener('timeupdate', () => {
              if (audio.duration) {
                navigator.mediaSession.setPositionState({
                  duration: audio.duration,
                  playbackRate: audio.playbackRate,
                  position: audio.currentTime
                });
              }
            });
            
            // Atualizar estado quando tocar/pausar
            audio.addEventListener('play', () => {
              navigator.mediaSession.playbackState = 'playing';
              console.log('🎵 Estado: playing');
            });
            
            audio.addEventListener('pause', () => {
              navigator.mediaSession.playbackState = 'paused';
              console.log('⏸️ Estado: paused');
            });
            
            audio.addEventListener('ended', () => {
              navigator.mediaSession.playbackState = 'none';
              console.log('✅ Áudio finalizado');
              // Remover do DOM após finalizar
              if (audio.parentNode) {
                audio.parentNode.removeChild(audio);
              }
            });
            
            console.log('✅ Media Session configurada!');
          }
          
          // Tocar áudio com retry agressivo para iOS
          const playAudio = async () => {
            try {
              // Tentar carregar primeiro
              await audio.load();
              console.log('✅ [iOS] Áudio carregado');
              
              // Aguardar DOM estar pronto (crítico no iOS ao abrir PWA)
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Tentar reproduzir
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                await playPromise;
                console.log('✅ [iOS] Áudio reproduzindo automaticamente!');
              }
            } catch (err) {
              console.error('❌ [iOS] Erro ao reproduzir:', err.name, err.message);
              
              // FALLBACK VISUAL para iOS
              if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                console.log('📱 [iOS] Mostrando botão de play (fallback)');
                
                // Criar overlay completo
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  z-index: 999999;
                  background: rgba(0, 0, 0, 0.85);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  backdrop-filter: blur(10px);
                `;
                
                const playButton = document.createElement('button');
                playButton.textContent = '🎵 Tocar Áudio da Notificação';
                playButton.style.cssText = `
                  padding: 24px 48px;
                  font-size: 20px;
                  font-weight: bold;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border: none;
                  border-radius: 16px;
                  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.6);
                  cursor: pointer;
                  transform: scale(1);
                  transition: transform 0.2s ease;
                `;
                
                playButton.ontouchstart = playButton.onmousedown = () => {
                  playButton.style.transform = 'scale(0.95)';
                };
                playButton.ontouchend = playButton.onmouseup = () => {
                  playButton.style.transform = 'scale(1)';
                };
                
                playButton.onclick = async () => {
                  try {
                    await audio.play();
                    console.log('✅ [iOS] Áudio tocando após interação');
                    document.body.removeChild(overlay);
                  } catch (e) {
                    console.error('❌ [iOS] Falhou com clique:', e);
                    alert('Não foi possível reproduzir o áudio.');
                    document.body.removeChild(overlay);
                  }
                };
                
                overlay.appendChild(playButton);
                document.body.appendChild(overlay);
                
                // Auto-remover após 30s
                setTimeout(() => {
                  if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                  }
                }, 30000);
              }
            }
          };
          
          // Tentar tocar com delay para PWA carregar
          setTimeout(() => playAudio(), 200);
      } catch (err) {
        console.error('❌ Erro ao criar áudio com Media Session:', err);
      }
    }
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
