import { LayoutDashboard, Calendar, MessageCircle, Users, Settings, Trophy, Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const MobileBottomNav = () => {
  const location = useLocation();
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

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 Navegação direta para:', path);
    window.location.href = path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-[9999] pointer-events-auto">
      <div className="flex justify-around items-center py-2">
        {allowedItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={(e) => handleNavigation(item.path, e)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ touchAction: 'manipulation' }}
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