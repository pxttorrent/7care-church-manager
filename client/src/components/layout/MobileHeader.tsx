import { Bell, MessageCircle, Settings as SettingsIcon, User, LogOut, Sparkles } from 'lucide-react';
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
          <div 
            className="relative" 
            style={{ 
              transform: `translateX(-1%) translateX(${mobileHeaderLayout.logo.offsetX}px) translateY(${mobileHeaderLayout.logo.offsetY}px)` 
            }}
          >
            {systemLogo && (
              <img 
                src={systemLogo} 
                alt="7care" 
                className="w-20 h-20 drop-shadow-sm object-contain"
                onError={(e) => {
                  // Remove a logo em caso de erro
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

          </div>

          
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