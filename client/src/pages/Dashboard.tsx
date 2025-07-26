import { Calendar, Users, MessageSquare, Video, BarChart3, Clock, Heart, Plus, Cake, TrendingUp, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real dashboard statistics from API
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Use real data when available, fallback to default values
  const stats = dashboardStats || {
    totalUsers: 0,
    totalInterested: 0,
    totalChurches: 0,
    pendingApprovals: 0,
    thisWeekEvents: 0,
    birthdaysToday: 0,
    birthdaysThisWeek: 0,
    totalEvents: 0,
    approvedUsers: 0
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const quickActions = {
    admin: [
      { title: "Gerenciar Usuários", icon: Users, action: () => navigate('/users'), color: "bg-blue-500" },
      { title: "Ver Relatórios", icon: BarChart3, action: () => navigate('/reports'), color: "bg-green-500" },
      { title: "Configurações", icon: MessageSquare, action: () => navigate('/settings'), color: "bg-purple-500" }
    ],
    missionary: [
      { title: "Meus Interessados", icon: Heart, action: () => navigate('/my-interested'), color: "bg-red-500" },
      { title: "Nova Reunião", icon: Plus, action: () => navigate('/meetings'), color: "bg-blue-500" },
      { title: "Enviar Mensagem", icon: MessageSquare, action: () => navigate('/messages'), color: "bg-green-500" }
    ],
    member: [
      { title: "Ver Agenda", icon: Calendar, action: () => navigate('/calendar'), color: "bg-blue-500" },
      { title: "Chat", icon: MessageSquare, action: () => navigate('/chat'), color: "bg-green-500" },
      { title: "Videochamadas", icon: Video, action: () => navigate('/video-calls'), color: "bg-purple-500" }
    ],
    interested: [
      { title: "Próximos Estudos", icon: Calendar, action: () => navigate('/calendar'), color: "bg-blue-500" },
      { title: "Agendar Reunião", icon: Clock, action: () => navigate('/meetings'), color: "bg-green-500" }
    ]
  };

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">{stats.approvedUsers} usuários aprovados</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interessados</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalInterested}</div>
          <p className="text-xs text-muted-foreground">Pessoas em processo de interesse</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Igrejas Ativas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalChurches}</div>
          <p className="text-xs text-muted-foreground">Cadastradas no sistema</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos da Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.thisWeekEvents}</div>
          <p className="text-xs text-muted-foreground">Incluindo cultos e estudos</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.pendingApprovals}</div>
          <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aniversários Hoje</CardTitle>
          <Cake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.birthdaysToday}</div>
          <p className="text-xs text-muted-foreground">{stats.birthdaysThisWeek} esta semana</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderMissionaryDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meus Interessados</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalInterested}</div>
          <p className="text-xs text-muted-foreground">Acompanhando ativamente</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos da Semana</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.thisWeekEvents}</div>
          <p className="text-xs text-muted-foreground">Programados</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">Cadastrados</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aniversários</CardTitle>
          <Cake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats.birthdaysToday}</div>
          <p className="text-xs text-muted-foreground">{stats.birthdaysThisWeek} esta semana</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderMemberDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.thisWeekEvents}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aniversários</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.birthdaysToday}</div>
            <p className="text-xs text-muted-foreground">{stats.birthdaysThisWeek} esta semana</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInterestedDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.thisWeekEvents}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">No sistema</p>
          </CardContent>
        </Card>

        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aniversários</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.birthdaysToday}</div>
            <p className="text-xs text-muted-foreground">{stats.birthdaysThisWeek} esta semana</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuickActions = () => {
    const userRole = user?.role as keyof typeof quickActions;
    const actions = quickActions[userRole] || [];

    return (
      <Card className="shadow-divine">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color} hover:opacity-90`}
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium text-center">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
          <p className="text-muted-foreground">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel de controle do 7Care Plus
        </p>
      </div>

      {/* Role-specific Dashboard */}
      {user.role === 'admin' && renderAdminDashboard()}
      {user.role === 'missionary' && renderMissionaryDashboard()}
      {user.role === 'member' && renderMemberDashboard()}
      {user.role === 'interested' && renderInterestedDashboard()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Birthday Section */}
      {stats.birthdaysToday > 0 && (
        <Card className="shadow-divine border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Cake className="h-5 w-5" />
              Aniversariantes de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.birthdaysToday === 1 
                ? "Há 1 pessoa fazendo aniversário hoje!" 
                : `Há ${stats.birthdaysToday} pessoas fazendo aniversário hoje!`
              }
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate('/users')}
              data-testid="view-birthdays-button"
            >
              Ver Aniversariantes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;