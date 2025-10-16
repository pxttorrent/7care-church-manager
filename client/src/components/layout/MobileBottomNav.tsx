import { LayoutDashboard, Calendar, Users, Settings, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { memo } from 'react';
import { useModal } from '@/contexts/ModalContext';

export const MobileBottomNav = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAnyModalOpen } = useModal();
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
             title: user?.role === 'admin' ? 'Usuários' : 'Discipulado',
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
  const allowedItems = useMemo(() => {
    const userRole = user?.role;
    const filtered = menuStructure.filter(item => {
      // Verificação mais flexível para incluir roles parciais
      const hasAccess = user && (
        item.roles.includes(userRole) ||
        item.roles.some(role => userRole?.includes(role)) ||
        item.roles.some(role => role.includes(userRole))
      );
      return hasAccess;
    });
    
    console.log('🔍 MobileBottomNav - Debug:', {
      userRole: userRole,
      userRoleType: typeof userRole,
      menuStructure: menuStructure.map(item => ({ title: item.title, roles: item.roles })),
      filteredItems: filtered.map(item => ({ title: item.title, roles: item.roles })),
      allRoles: ['admin', 'missionary', 'member', 'interested']
    });
    return filtered;
  }, [menuStructure, user]);

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

  // Classes fixas para sempre usar o estilo claro (que funciona bem em qualquer fundo)
  const navClasses = "bg-white/30 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl pointer-events-auto";
  const slidingBgClasses = "bg-white/50 backdrop-blur-sm rounded-2xl transition-all duration-300 ease-out shadow-lg";
  
  const iconClasses = (isActive: boolean) => {
    return isActive ? 'scale-110 text-gray-800' : 'scale-100 text-gray-600';
  };

  const textClasses = (isActive: boolean) => {
    return isActive ? 'opacity-100 font-semibold text-gray-800' : 'opacity-80 text-gray-600';
  };

  const handleNavigation = useCallback((path: string, index: number) => {
    if (location.pathname === path) {
      console.log('🔄 Já está na página:', path);
      return;
    }
    
    console.log('🔄 FORÇANDO navegação de', location.pathname, '→', path);
    
    setActiveIndex(index);
    window.location.href = path;
  }, [location.pathname]);

  // Log para debug
  console.log('🔍 MobileBottomNav - Render:', {
    userRole: user?.role,
    allowedItemsCount: allowedItems.length,
    activeIndex,
    location: location.pathname
  });

  // Se não há itens permitidos, usar itens básicos como fallback
  const finalItems = allowedItems.length > 0 ? allowedItems : [
    {
      title: 'Início',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'missionary', 'member', 'interested']
    },
    {
      title: 'Agenda',
      icon: Calendar,
      path: '/calendar',
      roles: ['admin', 'missionary', 'member', 'interested']
    },
    {
      title: 'Menu',
      icon: Settings,
      path: '/menu',
      roles: ['admin', 'missionary', 'member', 'interested']
    }
  ];

  if (allowedItems.length === 0) {
    console.warn('⚠️ MobileBottomNav: Nenhum item permitido para o role:', user?.role, '- usando fallback');
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 p-4 pointer-events-none transition-transform duration-300 ease-in-out`}
      style={{ 
        zIndex: 999999,
        transform: isAnyModalOpen ? 'translateY(100%)' : 'translateY(0)'
      }}
    >
      {/* Menu principal suspenso */}
      <nav 
        ref={navRef}
        className={navClasses}
      >
        <div className="relative flex justify-around items-center py-2 px-3">
          {/* Fundo deslizante centralizado */}
          <div 
            className={`absolute top-1.5 bottom-1.5 ${slidingBgClasses}`}
            style={{
              width: `calc(${100 / finalItems.length}% - 10px)`,
              left: `calc(${(100 / finalItems.length) * activeIndex}% + 5px)`,
              height: 'calc(100% - 12px)'
            }}
          />
          
          {finalItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation(item.path, index);
                }}
                className="relative flex flex-col items-center justify-center w-full h-12 transition-all duration-300 ease-out"
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent'
                }}
                type="button"
              >
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <item.icon className={`w-5 h-5 mb-1 transition-all duration-300 ${iconClasses(isActive)}`} />
                  <span className={`text-xs font-medium transition-all duration-300 ${textClasses(isActive)}`}>
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
});