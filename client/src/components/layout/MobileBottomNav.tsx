import { LayoutDashboard, Calendar, MessageCircle, Users, Settings, Trophy, Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  const handleNavigation = (path: string) => {
    // Evitar navegação duplicada
    if (location.pathname === path) {
      console.log('🔄 Já está na página:', path);
      return;
    }
    
    console.log('🔄 FORÇANDO navegação de', location.pathname, '→', path);
    
    // SOLUÇÃO DEFINITIVA: Usar window.location.href para forçar navegação completa
    // Isso garante que funciona mesmo se React Router estiver travado
    window.location.href = path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg pointer-events-auto" 
      style={{ zIndex: 999999 }}
    >
      <div className="flex justify-around items-center py-2 pointer-events-auto">
        {allowedItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation(item.path);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors pointer-events-auto ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                zIndex: 1000000
              }}
              type="button"
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};