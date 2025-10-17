/**
 * Utilitário para pré-cachear assets importantes do aplicativo
 */

// Lista de assets críticos para funcionamento offline
const CRITICAL_ASSETS = [
  // CSS principal
  '/assets/index-CSJvB5oa.css',
  
  // JavaScript principal
  '/assets/index-CwpLeuZK.js',
  '/assets/vendor-v6ZOr5pf.js',
  
  // UI Components
  '/assets/ui-CM4P41nz.js',
  
  // Páginas principais (nomes atuais do build)
  '/assets/Dashboard-BoOTJ6EK.js',
  '/assets/Users-BgSc4TE5.js',
  '/assets/Calendar-OmPIzKFj.js',
  '/assets/Settings-B39PtK9-.js',
  
  // Assets dinâmicos críticos
  '/assets/charts-56rtB2he.js',
  '/assets/dialog-5AauICAY.js',
  '/assets/avatar-Te2cL-OZ.js',
  '/assets/cake-Bg_x9x8b.js',
  '/assets/trending-up-CpTQnMrE.js',
  '/assets/mount-icon-DKUggKtl.js',
  '/assets/pointsCalculator-BwBrJ8sV.js',
  '/assets/heart-f_Goj_6w.js',
  '/assets/square-check-big-Bav-IFLK.js',
  '/assets/scroll-area-BzbHQAkl.js',
  '/assets/textarea-DLnnPmmi.js',
  '/assets/checkbox-53PPl33n.js',
  '/assets/circle-help-6Z7SS3ln.js',
  
  // Assets estáticos
  '/assets/mountain-1-DA6NDOMe.png',
  '/assets/mountain-2-DKwS_eIU.png',
  '/assets/mountain-3-DsAta6xj.png',
  '/assets/mountain-4-qWkC1P-B.png',
  '/assets/mountain-5-BZa9V_Be.png',
  '/assets/mountain-6-XswTLRp5.png',
  '/assets/mountain-7-CaX0_q1b.png',
  '/assets/mountain-8-RhI3G3z5.png',
  '/assets/mountain-9-l9GNB6hj.png',
  
  // Ícones e logos
  '/7care-logo.png',
  '/7carelogonew.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/favicon.ico'
];

/**
 * Pré-cachear assets críticos
 */
export async function precacheCriticalAssets(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Usar MessageChannel para comunicação com Service Worker
    const messageChannel = new MessageChannel();
    
    return new Promise((resolve, reject) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('✅ Assets críticos pré-cacheados com sucesso');
          resolve();
        } else {
          console.error('❌ Erro ao pré-cachear assets:', event.data.error);
          reject(new Error(event.data.error));
        }
      };

      registration.active?.postMessage(
        {
          type: 'CACHE_ASSETS',
          assets: CRITICAL_ASSETS
        },
        [messageChannel.port2]
      );
    });
  } catch (error) {
    console.error('❌ Erro ao comunicar com Service Worker:', error);
    throw error;
  }
}

/**
 * Verificar se assets estão em cache
 */
export async function checkCacheStatus(): Promise<{
  totalAssets: number;
  cachedAssets: number;
  cachePercentage: number;
}> {
  if (!('caches' in window)) {
    return { totalAssets: 0, cachedAssets: 0, cachePercentage: 0 };
  }

  try {
    const cacheNames = await caches.keys();
    let cachedAssets = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cachedAssets += keys.length;
    }

    const totalAssets = CRITICAL_ASSETS.length;
    const cachePercentage = totalAssets > 0 ? Math.round((cachedAssets / totalAssets) * 100) : 0;

    return {
      totalAssets,
      cachedAssets,
      cachePercentage
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status do cache:', error);
    return { totalAssets: 0, cachedAssets: 0, cachePercentage: 0 };
  }
}

/**
 * Limpar cache antigo
 */
export async function clearOldCache(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    const currentCaches = ['7care-v2', '7care-dynamic-v2'];
    
    for (const cacheName of cacheNames) {
      if (!currentCaches.includes(cacheName)) {
        await caches.delete(cacheName);
        console.log('🗑️ Cache antigo removido:', cacheName);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar cache antigo:', error);
  }
}

/**
 * Obter estatísticas detalhadas do cache
 */
export async function getCacheStats(): Promise<{
  cacheNames: string[];
  totalSize: number;
  assetsByCache: Record<string, number>;
}> {
  if (!('caches' in window)) {
    return { cacheNames: [], totalSize: 0, assetsByCache: {} };
  }

  try {
    const cacheNames = await caches.keys();
    const assetsByCache: Record<string, number> = {};
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      assetsByCache[cacheName] = keys.length;
      
      // Estimar tamanho (aproximado)
      totalSize += keys.length * 100; // Estimativa de 100KB por asset
    }

    return {
      cacheNames,
      totalSize,
      assetsByCache
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cache:', error);
    return { cacheNames: [], totalSize: 0, assetsByCache: {} };
  }
}
