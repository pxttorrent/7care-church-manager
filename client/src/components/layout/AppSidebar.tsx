import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Video, 
  BarChart3, 
  Settings, 
  UserPlus,
  MessageCircle,
  Clock,
  FileText,
  Heart
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import logo from '@/assets/logo.png';

// Navigation items with permissions
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'missionary', 'member', 'interested'] as UserRole[]
  },
  {
    title: 'Agenda',
    url: '/calendar',
    icon: Calendar,
    roles: ['admin', 'missionary', 'member', 'interested'] as UserRole[]
  },
  {
    title: 'Agendamentos',
    url: '/meetings',
    icon: Clock,
    roles: ['admin', 'missionary', 'member', 'interested'] as UserRole[]
  },
  {
    title: 'Videochamadas',
    url: '/video-calls',
    icon: Video,
    roles: ['admin', 'missionary', 'member'] as UserRole[]
  },
  {
    title: 'Usuários',
    url: '/users',
    icon: Users,
    roles: ['admin'] as UserRole[]
  },
  {
    title: 'Interessados',
    url: '/interested',
    icon: UserPlus,
    roles: ['admin', 'missionary'] as UserRole[]
  },
  {
    title: 'Meus Interessados',
    url: '/my-interested',
    icon: Heart,
    roles: ['missionary'] as UserRole[]
  },
  {
    title: 'Mensagens',
    url: '/messages',
    icon: MessageSquare,
    roles: ['admin', 'missionary'] as UserRole[]
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: MessageCircle,
    roles: ['admin', 'missionary', 'member'] as UserRole[]
  },
  {
    title: 'Relatórios',
    url: '/reports',
    icon: BarChart3,
    roles: ['admin', 'missionary'] as UserRole[]
  },
  {
    title: 'Meus Relatórios',
    url: '/my-reports',
    icon: FileText,
    roles: ['missionary'] as UserRole[]
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
    roles: ['admin'] as UserRole[]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  
  const isCollapsed = state === 'collapsed';

  // Filter items based on user role
  const allowedItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const getNavClasses = (url: string) => {
    const isActive = currentPath === url;
    return isActive 
      ? "bg-gradient-primary text-primary-foreground font-medium shadow-divine" 
      : "hover:bg-muted/50 text-foreground";
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo Section */}
        <div className={`flex items-center gap-3 p-4 border-b ${isCollapsed ? 'justify-center' : ''}`}>
          <img src={logo} alt="7Care Plus" className="w-8 h-8" />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-primary">
                7Care Plus
              </h1>
              <p className="text-xs text-muted-foreground">Gestão Eclesiástica</p>
            </div>
          )}
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'missionary' ? 'Missionário' :
                   user.role === 'member' ? 'Membro' : 'Interessado'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}