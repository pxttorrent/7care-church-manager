import { Bell, MessageCircle, Settings as SettingsIcon, User, LogOut, Sparkles, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { useSystemLogo } from '@/hooks/useSystemLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MobileHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { systemLogo } = useSystemLogo();
  const [mobileHeaderLayout, setMobileHeaderLayout] = useState({
    logo: { offsetX: 0, offsetY: 0 },
    welcome: { offsetX: 0, offsetY: 0 },
    actions: { offsetX: 0, offsetY: 0 }
  });

  // Estado offline simples (apenas para admin)
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItems, setPendingItems] = useState(0);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Verificar se tem dados offline baixados
  useEffect(() => {
    if (isAdmin) {
      const dataDownloaded = localStorage.getItem('offline-data-downloaded') === 'true';
      setHasOfflineData(dataDownloaded);
    }
  }, [isAdmin]);

  // Funções de fila inline (sem arquivo separado)
  const SYNC_QUEUE_KEY = 'offline-sync-queue';

  const getSyncQueue = () => {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveSyncQueue = (queue: any[]) => {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setPendingItems(queue.filter((i: any) => i.status === 'pending').length);
    } catch (e) {
      console.error('Erro ao salvar fila:', e);
    }
  };

  const addToQueue = (method: string, endpoint: string, data?: any) => {
    if (!isAdmin) return;
    
    const item = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    };

    const queue = getSyncQueue();
    queue.push(item);
    saveSyncQueue(queue);

    toast({ title: '📥 Ação salva', description: 'Será sincronizada quando voltar online.' });
  };

  const syncQueue = async () => {
    if (!isAdmin || !isOnline || isSyncing) return;

    setIsSyncing(true);
    const queue = getSyncQueue();
    const pending = queue.filter((i: any) => i.status === 'pending');

    if (pending.length === 0) {
      setIsSyncing(false);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        const res = await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: item.data ? JSON.stringify(item.data) : undefined,
          credentials: 'include'
        });

        if (res.ok) {
          queue.splice(queue.findIndex((i: any) => i.id === item.id), 1);
          success++;
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (e) {
        item.retries = (item.retries || 0) + 1;
        if (item.retries >= 3) item.status = 'error';
        failed++;
      }
    }

    saveSyncQueue(queue);
    setIsSyncing(false);

    if (success > 0) {
      toast({ title: '✅ Sincronizado!', description: `${success} ${success === 1 ? 'item' : 'itens'}` });
    }
    if (failed > 0) {
      toast({ title: '⚠️ Alguns falharam', description: `${failed} ${failed === 1 ? 'item' : 'itens'}`, variant: 'destructive' });
    }
  };

  // Atualizar contagem ao montar e quando fila mudar
  useEffect(() => {
    if (!isAdmin) return;

    const updateCount = () => {
      const queue = getSyncQueue();
      setPendingItems(queue.filter((i: any) => i.status === 'pending').length);
    };

    updateCount();

    // Listener para atualizações da fila (do interceptor)
    window.addEventListener('offlineQueueUpdated', updateCount);

    return () => {
      window.removeEventListener('offlineQueueUpdated', updateCount);
    };
  }, [isAdmin]);

  // Listener de online/offline (ADMIN ONLY)
  useEffect(() => {
    if (!isAdmin) return;

    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: '🟢 Você está online!', description: 'Sincronizando dados...' });
      setTimeout(() => syncQueue(), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({ 
        title: '🔴 Modo Offline Ativado', 
        description: 'Você pode continuar trabalhando. Dados serão sincronizados quando voltar online.',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAdmin, toast, isOnline]);







  // Listen for layout updates from settings
  useEffect(() => {
    const handleLayoutUpdate = (event: CustomEvent) => {
      setMobileHeaderLayout(event.detail.layout);
    };

    window.addEventListener('mobileHeaderLayoutUpdated', handleLayoutUpdate as EventListener);
    return () => {
      window.removeEventListener('mobileHeaderLayoutUpdated', handleLayoutUpdate as EventListener);
    };
  }, []);

  // Load mobile header layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('mobileHeaderLayout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setMobileHeaderLayout(parsedLayout);
      } catch (error) {
        console.error('❌ MobileHeader - Erro ao carregar layout:', error);
      }
    }
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);



  // Lógica de auto-hide baseada no scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar quando estiver no topo
      if (currentScrollY <= 50) {
        setIsVisible(true);
      }
      // Auto-hide quando rolar para baixo
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      // Mostrar quando rolar para cima
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getPhotoUrl = () => {
    if (!user?.profilePhoto) return null;
    return user.profilePhoto.startsWith('http')
      ? user.profilePhoto
      : `/uploads/${user.profilePhoto}`;
  };

  const handleProfile = () => navigate('/meu-cadastro');
  const handleLogout = () => {
    logout();
    toast({ title: 'Logout realizado', description: 'Você foi desconectado com sucesso' });
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-md border-b border-blue-100/50 shadow-lg`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200" 
            style={{ 
              transform: `translateX(-1%) translateX(${mobileHeaderLayout.logo.offsetX}px) translateY(${mobileHeaderLayout.logo.offsetY}px)` 
            }}
            title="Voltar ao início"
          >
            {systemLogo && (
              <img 
                src={systemLogo} 
                alt="7care" 
                className="w-16 h-16 drop-shadow-sm object-contain pointer-events-none"
                onError={(e) => {
                  // Remove a logo em caso de erro
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

          </button>

          
          {/* Informações de Boas-vindas em linha com a logo */}
          {user && (
            <div 
              className="flex items-center gap-2 pl-3 border-l border-gray-200/50"
              style={{
                transform: `translateX(${mobileHeaderLayout.welcome.offsetX}px) translateY(${mobileHeaderLayout.welcome.offsetY}px)`
              }}
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-base font-medium text-gray-700">
                  {greeting}, {(user.name || 'Usuário').split(' ')[0]}!
                </span>
              </div>

            </div>
          )}
        </div>
        
        <div 
          className="flex items-center gap-2"
          style={{
            transform: `translateX(${mobileHeaderLayout.actions.offsetX}px) translateY(${mobileHeaderLayout.actions.offsetY}px)`
          }}
        >
          {/* Indicador de Status Offline (ADMIN ONLY - COM SYNC) */}
          {isAdmin && (
            <button
              onClick={() => isSyncing ? null : syncQueue()}
              disabled={isSyncing}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isSyncing 
                  ? 'bg-blue-100 text-blue-700 cursor-wait'
                  : isOnline 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                    : 'bg-red-100 text-red-700 cursor-default'
              }`}
              title={
                isSyncing 
                  ? 'Sincronizando...'
                  : isOnline 
                    ? `Online - Clique para sincronizar${hasOfflineData ? ' | Dados baixados no dispositivo ✓' : ''}`
                    : `Offline${hasOfflineData ? ' - Dados salvos no dispositivo' : ' - Sem dados salvos'}`
              }
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : isOnline ? (
                <Cloud className="w-3.5 h-3.5" />
              ) : (
                <CloudOff className="w-3.5 h-3.5" />
              )}
              
              <span className="hidden sm:inline">
                {isSyncing ? 'Sync...' : isOnline ? 'Online' : 'Offline'}
              </span>
              
              {/* Badge de itens pendentes */}
              {pendingItems > 0 && !isSyncing && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingItems > 9 ? '9+' : pendingItems}
                </span>
              )}
            </button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/chat')} 
            title="Chat"
            className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200/50 hover:border-green-300/50 transition-all duration-200"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/notifications')}
            title="Notificações"
            className="bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/50 hover:border-amber-300/50 transition-all duration-200"
          >
            <Bell className="w-5 h-5 text-amber-600" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0">
                  <div className="relative w-8 h-8">
                    {getPhotoUrl() ? (
                      <>
                        <img
                          src={getPhotoUrl() || ''}
                          alt={`Foto de ${user.name}`}
                          className="w-8 h-8 rounded-full object-cover border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm"
                          style={{ display: 'none' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-popover">
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Cadastro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>


    </header>
  );
};