import { LayoutDashboard, Calendar, Users, Settings, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { memo } from 'react';

export const MobileBottomNav = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Estrutura simplificada do menu - memoizada para evitar recriações
  const menuStructure = useMemo(() => [
    {
      title: 'Início',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'missionary', 'member', 'interested'],
      submenu: []
    },
    {
      title: 'Agenda',
      icon: Calendar,
      path: '/calendar',
      roles: ['admin', 'missionary', 'member', 'interested'],
      submenu: []
    },
    {
      title: 'Usuários',
      icon: Users,
      path: user?.role === 'admin' ? '/users' : '/my-interested',
      roles: ['admin', 'missionary', 'member'],
      submenu: []
    },
    {
      title: '7Mount',
      icon: Trophy,
      path: '/gamification',
      roles: ['admin', 'missionary', 'member', 'interested'],
      submenu: []
    },
    {
      title: 'Menu',
      icon: Settings,
      path: '/menu',
      roles: ['admin', 'missionary', 'member', 'interested'],
      submenu: []
    }
  ], [user?.role]);

  // Filtrar itens baseado no role do usuário - memoizado
  const allowedItems = useMemo(() => 
    menuStructure.filter(item => 
      user && item.roles.includes(user.role)
    ), [menuStructure, user]
  );

  // Atualizar índice ativo baseado na rota atual
  useEffect(() => {
    const findActiveIndex = () => {
      for (let i = 0; i < allowedItems.length; i++) {
        const item = allowedItems[i];
        
        // Verificar se a rota atual é o item principal
        if (location.pathname === item.path) {
          return i;
        }
      }
      return 0;
    };

    const newActiveIndex = findActiveIndex();
    setActiveIndex(newActiveIndex);
  }, [location.pathname, allowedItems]);

  const handleNavigation = useCallback((path: string, index: number) => {
    if (location.pathname === path) {
      console.log('🔄 Já está na página:', path);
      return;
    }
    
    console.log('🔄 FORÇANDO navegação de', location.pathname, '→', path);
    
    setActiveIndex(index);
    window.location.href = path;
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none" style={{ zIndex: 999999 }}>
      {/* Menu principal suspenso */}
      <nav 
        ref={navRef}
        className="bg-background/95 backdrop-blur-sm border rounded-3xl shadow-2xl pointer-events-auto"
      >
        <div className="relative flex justify-around items-center py-3 px-4">
          {/* Fundo deslizante centralizado */}
          <div 
            className="absolute top-2 bottom-2 bg-primary/20 rounded-2xl transition-all duration-300 ease-out shadow-sm"
            style={{
              width: `calc(${100 / allowedItems.length}% - 8px)`,
              left: `calc(${(100 / allowedItems.length) * activeIndex}% + 4px)`
            }}
          />
          
          {allowedItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation(item.path, index);
                }}
                className={`relative flex flex-col items-center justify-center w-full h-14 transition-all duration-300 ease-out ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent'
                }}
                type="button"
              >
                <item.icon className={`w-6 h-6 mb-1 transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`} />
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive ? 'opacity-100 font-semibold' : 'opacity-80'
                }`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
});