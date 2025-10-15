import { LayoutDashboard, Calendar, MessageCircle, Users, Settings, Trophy, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmenu, setShowSubmenu] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Estrutura hierárquica de menus como Windows
  const menuStructure = [
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
      title: 'Pessoas',
      icon: Users,
      roles: ['admin', 'missionary', 'member'],
      submenu: [
        {
          title: user?.role === 'admin' ? 'Usuários' : 'Interessados',
          icon: Users,
          path: user?.role === 'admin' ? '/users' : '/my-interested',
          roles: ['admin', 'missionary', 'member']
        },
        {
          title: 'Chat',
          icon: MessageCircle,
          path: '/chat',
          roles: ['admin', 'missionary', 'member']
        }
      ]
    },
    {
      title: 'Orações',
      icon: Heart,
      path: '/prayers',
      roles: ['admin', 'missionary', 'member', 'interested'],
      submenu: []
    },
    {
      title: 'Mais',
      icon: Settings,
      roles: ['admin', 'missionary', 'member', 'interested'],
      submenu: [
        {
          title: 'Pontuação',
          icon: Trophy,
          path: '/gamification',
          roles: ['admin', 'missionary', 'member', 'interested']
        },
        {
          title: 'Configurações',
          icon: Settings,
          path: '/menu',
          roles: ['admin', 'missionary', 'member', 'interested']
        }
      ]
    }
  ];

  // Filtrar itens baseado no role do usuário
  const allowedItems = menuStructure.filter(item => 
    user && (item.roles.includes(user.role) || item.submenu.some(sub => sub.roles.includes(user.role)))
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
        
        // Verificar se a rota atual está nos submenus
        const activeSubmenu = item.submenu.find(sub => location.pathname === sub.path);
        if (activeSubmenu) {
          return i;
        }
      }
      return 0;
    };

    const newActiveIndex = findActiveIndex();
    setActiveIndex(newActiveIndex);
  }, [location.pathname, allowedItems]);

  const handleNavigation = (path: string, index: number) => {
    if (location.pathname === path) {
      console.log('🔄 Já está na página:', path);
      return;
    }
    
    console.log('🔄 FORÇANDO navegação de', location.pathname, '→', path);
    
    setActiveIndex(index);
    setShowSubmenu(null);
    window.location.href = path;
  };

  const handleMainMenuClick = (item: any, index: number) => {
    if (item.submenu.length > 0) {
      // Se tem submenu, toggle o submenu
      setShowSubmenu(showSubmenu === index ? null : index);
    } else if (item.path) {
      // Se não tem submenu, navegar diretamente
      handleNavigation(item.path, index);
    }
  };

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
                  handleMainMenuClick(item, index);
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
                
                {/* Indicador de submenu */}
                {item.submenu.length > 0 && (
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300 ${
                    showSubmenu === index ? 'bg-primary scale-125' : 'bg-primary/50 scale-100'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Submenu suspenso */}
        {showSubmenu !== null && allowedItems[showSubmenu]?.submenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-background/95 backdrop-blur-sm border rounded-2xl shadow-xl pointer-events-auto">
            <div className="py-3 px-2">
              {allowedItems[showSubmenu].submenu
                .filter(sub => user && sub.roles.includes(user.role))
                .map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation(subItem.path, showSubmenu);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      location.pathname === subItem.path 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <subItem.icon className="w-5 h-5" />
                    <span className="font-medium">{subItem.title}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};