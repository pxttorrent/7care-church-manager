import { Calendar, Users, MessageSquare, Video, BarChart3, Clock, Heart, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const dashboardData = {
    admin: {
      totalUsers: 156,
      totalInterested: 23,
      totalChurches: 5,
      pendingApprovals: 3,
      thisWeekEvents: 12,
      totalMessages: 89
    },
    missionary: {
      myInterested: 8,
      scheduledMeetings: 4,
      completedStudies: 15,
      thisWeekGoal: 10
    },
    member: {
      nextEvents: 3,
      unreadMessages: 2,
      completedActivities: 7,
      points: 450,
      level: 3,
      nextLevelPoints: 500
    },
    interested: {
      nextStudy: "Quarta-feira, 19h",
      completedLessons: 3,
      nextMeeting: "Amanhã",
      points: 85,
      level: 1,
      nextLevelPoints: 100
    }
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
          <div className="text-2xl font-bold">{dashboardData.admin.totalUsers}</div>
          <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interessados</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.admin.totalInterested}</div>
          <p className="text-xs text-muted-foreground">+3 novos esta semana</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos da Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.admin.thisWeekEvents}</div>
          <p className="text-xs text-muted-foreground">Incluindo cultos e estudos</p>
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
          <div className="text-2xl font-bold">{dashboardData.missionary.myInterested}</div>
          <p className="text-xs text-muted-foreground">Acompanhando ativamente</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reuniões Agendadas</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.scheduledMeetings}</div>
          <p className="text-xs text-muted-foreground">Para esta semana</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudos Completos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.completedStudies}</div>
          <p className="text-xs text-muted-foreground">Neste mês</p>
        </CardContent>
      </Card>

      <Card className="shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meta da Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.missionary.thisWeekGoal}</div>
          <p className="text-xs text-muted-foreground">Contatos planejados</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderMemberDashboard = () => (
    <div className="space-y-6">
      {/* Points Progress Card */}
      <Card className="shadow-divine bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {dashboardData.member.level}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg">Nível {dashboardData.member.level}</div>
                <div className="text-sm text-muted-foreground">
                  {dashboardData.member.points} pontos totais
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Próximo nível</div>
              <div className="text-lg font-semibold text-primary">
                {dashboardData.member.nextLevelPoints} pts
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Nível</span>
              <span>{dashboardData.member.points}/{dashboardData.member.nextLevelPoints}</span>
            </div>
            <div className="bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(dashboardData.member.points / dashboardData.member.nextLevelPoints) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Faltam {dashboardData.member.nextLevelPoints - dashboardData.member.points} pontos para o próximo nível
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.member.nextEvents}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.member.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Não lidas</p>
          </CardContent>
        </Card>

        <Card className="shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.member.completedActivities}</div>
            <p className="text-xs text-muted-foreground">Concluídas este mês</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInterestedDashboard = () => (
    <div className="space-y-6">
      {/* Points Progress Card */}
      <Card className="shadow-divine bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {dashboardData.interested.level}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg">Nível {dashboardData.interested.level}</div>
                <div className="text-sm text-muted-foreground">
                  {dashboardData.interested.points} pontos totais
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Próximo nível</div>
              <div className="text-lg font-semibold text-primary">
                {dashboardData.interested.nextLevelPoints} pts
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Nível</span>
              <span>{dashboardData.interested.points}/{dashboardData.interested.nextLevelPoints}</span>
            </div>
            <div className="bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(dashboardData.interested.points / dashboardData.interested.nextLevelPoints) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Faltam {dashboardData.interested.nextLevelPoints - dashboardData.interested.points} pontos para o próximo nível
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle className="text-lg">Próximo Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-primary">{dashboardData.interested.nextStudy}</div>
            <p className="text-sm text-muted-foreground mt-2">Estudo bíblico em grupo</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-divine">
          <CardHeader>
            <CardTitle className="text-lg">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{dashboardData.interested.completedLessons} lições</div>
            <p className="text-sm text-muted-foreground mt-2">Completadas com sucesso</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const currentActions = quickActions[user?.role || 'interested'];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-lg p-8 text-white shadow-divine">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-white/90 text-lg">
          {user?.role === 'admin' && "Gerencie sua igreja com excelência"}
          {user?.role === 'missionary' && "Continue impactando vidas para Cristo"}
          {user?.role === 'member' && "Participe ativamente da comunidade"}
          {user?.role === 'interested' && "Continue sua jornada de fé"}
        </p>
      </div>

      {/* Dashboard Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Resumo</h2>
        {user?.role === 'admin' && renderAdminDashboard()}
        {user?.role === 'missionary' && renderMissionaryDashboard()}
        {user?.role === 'member' && renderMemberDashboard()}
        {user?.role === 'interested' && renderInterestedDashboard()}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentActions.map((action, index) => (
            <Card key={index} className="shadow-divine hover:shadow-glow transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;