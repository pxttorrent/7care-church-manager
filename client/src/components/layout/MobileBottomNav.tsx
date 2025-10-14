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
    
    console.log('🔄 Navegando para:', path, 'de:', location.pathname);
    
    // Fechar qualquer modal/dialog aberto antes de navegar
    const dialogs = document.querySelectorAll('[role="dialog"]');
    const overlays = document.querySelectorAll('[data-state="open"]');
    
    if (dialogs.length > 0 || overlays.length > 0) {
      console.log('⚠️ Fechando modais/overlays antes de navegar');
      dialogs.forEach(d => (d as HTMLElement).remove());
      overlays.forEach(o => (o as HTMLElement).remove());
    }
    
    // Forçar navegação com replace se necessário
    try {
      navigate(path, { replace: false });
      console.log('✅ Navegação executada para:', path);
    } catch (error) {
      console.error('❌ Erro ao navegar:', error);
      // Fallback: usar window.location
      window.location.href = path;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-[99999] pointer-events-auto">
      <div className="flex justify-around items-center py-2 pointer-events-auto">
        {allowedItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
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