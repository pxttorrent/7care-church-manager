import { useEffect, useState } from 'react';

// Todas as rotas que precisam ser cacheadas
const ROUTES_TO_CACHE = [
  '/',
  '/dashboard',
  '/menu',
  '/calendar',
  '/users',
  '/tasks',
  '/interested',
  '/my-interested',
  '/chat',
  '/settings',
  '/gamification',
  '/prayers',
  '/push-notifications',
  '/notifications',
  '/contact',
  '/meu-cadastro',
  '/elections',
  '/election-config',
  '/election-voting',
  '/election-dashboard',
  '/election-manage',
  '/first-access',
  '/login'
];

interface CacheStatus {
  isOnline: boolean;
  isCaching: boolean;
  cachedCount: number;
  totalCount: number;
  progress: number;
}

export function useOfflineCache() {
  const [status, setStatus] = useState<CacheStatus>({
    isOnline: navigator.onLine,
    isCaching: false,
    cachedCount: 0,
    totalCount: ROUTES_TO_CACHE.length,
    progress: 0
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      // Quando voltar online, cachear páginas novamente
      cacheAllPages();
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cachear todas as páginas no primeiro load
    cacheAllPages();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheAllPages = async () => {
    if (!('serviceWorker' in navigator) || !navigator.onLine) {
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isCaching: true, cachedCount: 0 }));

      // Enviar mensagem para o Service Worker cachear as URLs
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.active) {
        registration.active.postMessage({
          type: 'CACHE_URLS',
          urls: ROUTES_TO_CACHE
        });
      }

      // Também fazer fetch direto para garantir
      let cachedCount = 0;
      
      for (const route of ROUTES_TO_CACHE) {
        try {
          await fetch(route, { 
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          cachedCount++;
          setStatus(prev => ({
            ...prev,
            cachedCount,
            progress: Math.round((cachedCount / ROUTES_TO_CACHE.length) * 100)
          }));
        } catch (err) {
          console.warn(`Erro ao cachear ${route}:`, err);
        }
      }

      setStatus(prev => ({ ...prev, isCaching: false }));
      console.log(`✅ Cache completo: ${cachedCount}/${ROUTES_TO_CACHE.length} páginas`);
      
    } catch (error) {
      console.error('Erro ao cachear páginas:', error);
      setStatus(prev => ({ ...prev, isCaching: false }));
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🗑️ Cache limpo');
    }
  };

  const getCacheInfo = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const v25Cache = cacheNames.find(name => name.includes('7care-v25'));
      
      if (v25Cache) {
        const cache = await caches.open(v25Cache);
        const keys = await cache.keys();
        return {
          cacheName: v25Cache,
          totalItems: keys.length,
          items: keys.map(req => req.url)
        };
      }
    }
    return null;
  };

  return {
    ...status,
    cacheAllPages,
    clearCache,
    getCacheInfo
  };
}

