// Utilitário para forçar atualização do Service Worker
export const forceUpdateServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        console.log('🔄 Forçando atualização do Service Worker...');
        
        // Verificar se há uma nova versão esperando
        if (registration.waiting) {
          console.log('📦 Nova versão encontrada, ativando...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Recarregar a página após a atualização
          window.location.reload();
        } else {
          // Forçar atualização
          await registration.update();
          console.log('✅ Service Worker atualizado');
        }
      } else {
        console.log('⚠️ Nenhum Service Worker registrado');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar Service Worker:', error);
    }
  }
};

// Função para verificar se há atualizações disponíveis
export const checkForServiceWorkerUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        const newRegistration = await navigator.serviceWorker.register('/sw.js');
        
        if (newRegistration.waiting) {
          console.log('🆕 Nova versão do Service Worker disponível!');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
    }
  }
  
  return false;
};
