import { 
  Users, MessageSquare, Video, BarChart3, Settings, Clock, 
  Heart, FileText, UserPlus, Phone, LogOut, User, Bell 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Menu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate('/');
  };

  const menuItems = {
    admin: [
      { title: 'Usuários', icon: Users, path: '/users', color: 'bg-blue-500', description: 'Gerenciar membros' },
      { title: 'Interessados', icon: UserPlus, path: '/interested', color: 'bg-green-500', description: 'Novos contatos' },
      { title: 'Mensagens', icon: MessageSquare, path: '/messages', color: 'bg-purple-500', description: 'Comunicação' },
      { title: 'Videochamadas', icon: Video, path: '/video-calls', color: 'bg-red-500', description: 'Reuniões online' },
      { title: 'Relatórios', icon: BarChart3, path: '/reports', color: 'bg-orange-500', description: 'Análises' },
      { title: 'Agendamentos', icon: Clock, path: '/meetings', color: 'bg-teal-500', description: 'Marcar reuniões' },
      { title: 'Configurações', icon: Settings, path: '/settings', color: 'bg-gray-500', description: 'Sistema' }
    ],
    missionary: [
      { title: 'Meus Interessados', icon: Heart, path: '/my-interested', color: 'bg-red-500', description: 'Acompanhar pessoas' },
      { title: 'Mensagens', icon: MessageSquare, path: '/messages', color: 'bg-purple-500', description: 'Comunicação' },
      { title: 'Videochamadas', icon: Video, path: '/video-calls', color: 'bg-blue-500', description: 'Reuniões online' },
      { title: 'Meus Relatórios', icon: FileText, path: '/my-reports', color: 'bg-orange-500', description: 'Meus dados' },
      { title: 'Agendamentos', icon: Clock, path: '/meetings', color: 'bg-teal-500', description: 'Marcar reuniões' },
      { title: 'Interessados Gerais', icon: UserPlus, path: '/interested', color: 'bg-green-500', description: 'Todos os contatos' }
    ],
    member: [
      { title: 'Videochamadas', icon: Video, path: '/video-calls', color: 'bg-blue-500', description: 'Reuniões online' },
      { title: 'Agendamentos', icon: Clock, path: '/meetings', color: 'bg-teal-500', description: 'Marcar reuniões' },
      { title: 'Notificações', icon: Bell, path: '/notifications', color: 'bg-yellow-500', description: 'Avisos importantes' }
    ],
    interested: [
      { title: 'Agendamentos', icon: Clock, path: '/meetings', color: 'bg-teal-500', description: 'Marcar reuniões' },
      { title: 'Contato', icon: Phone, path: '/contact', color: 'bg-green-500', description: 'Falar conosco' }
    ]
  };

  const profileActions = [
    { title: 'Meu Cadastro', icon: User, path: '/meu-cadastro', color: 'bg-indigo-500' },
    { title: 'Tutorial', icon: FileText, path: '/first-access', color: 'bg-cyan-500' }
  ];

  const currentMenuItems = menuItems[user?.role || 'interested'];

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* User Profile Section */}
        <Card className="bg-gradient-hero text-white shadow-divine">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-white/90 capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'missionary' ? 'Missionário' :
                   user?.role === 'member' ? 'Membro' : 'Interessado'}
                </p>
                <p className="text-white/70 text-sm">{user?.church || 'Igreja Central'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Perfil</h3>
          <div className="grid grid-cols-2 gap-3">
            {profileActions.map((item) => (
              <Card 
                key={item.path} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Menu */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Funcionalidades</h3>
          <div className="grid grid-cols-2 gap-3">
            {currentMenuItems.map((item) => (
              <Card 
                key={item.path} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4">
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair do aplicativo
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Menu;