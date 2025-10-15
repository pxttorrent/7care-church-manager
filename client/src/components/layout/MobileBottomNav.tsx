import { LayoutDashboard, Calendar, MessageCircle, Users, Settings, Trophy, Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navItems = [
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
      title: 'Orações',
      icon: Heart,
      path: '/prayers',
      roles: ['admin', 'missionary', 'member', 'interested']
    },
    {
      title: user?.role === 'admin' ? 'Usuários' : 'Pessoas',
      icon: Users,
      path: user?.role === 'admin' ? '/users' : (user?.role === 'missionary' || user?.role === 'member') ? '/my-interested' : '/chat',
      roles: ['admin', 'missionary', 'member']
    },
    {
      title: 'Pontuação',
      icon: Trophy,
      path: '/gamification',
      roles: ['admin', 'missionary', 'member', 'interested']
    },
    {
      title: 'Menu',
      icon: Settings,
      path: '/menu',
      roles: ['admin', 'missionary', 'member', 'interested']
    }
  ];

  const allowedItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  // Atualizar índice ativo baseado na rota atual
  useEffect(() => {
    const currentIndex = allowedItems.findIndex(item => location.pathname === item.path);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname, allowedItems]);

  const handleNavigation = (path: string, index: number) => {
    // Evitar navegação duplicada
    if (location.pathname === path) {
      console.log('🔄 Já está na página:', path);
      return;
    }
    
    console.log('🔄 FORÇANDO navegação de', location.pathname, '→', path);
    
    // Atualizar índice ativo imediatamente para animação suave
    setActiveIndex(index);
    
    // Navegar usando window.location.href para forçar navegação completa
    window.location.href = path;
  };

  return (
    <nav 
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm shadow-2xl"
      style={{ zIndex: 999999 }}
    >
      <div className="relative flex justify-around items-center py-3 px-4">
        {/* Fundo deslizante */}
        <div 
          className="absolute top-2 bottom-2 bg-blue-500 rounded-full transition-all duration-300 ease-out shadow-lg"
          style={{
            width: `calc(${100 / allowedItems.length}% - 8px)`,
            left: `calc(${(100 / allowedItems.length) * activeIndex}% + 4px)`,
            transform: `translateX(${(100 / allowedItems.length) * activeIndex}%)`
          }}
        />
        
        {allowedItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.path}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation(item.path, index);
              }}
              className={`relative flex flex-col items-center justify-center w-full h-16 transition-all duration-300 ease-out ${
                isActive ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                zIndex: 1000000
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
  );
};